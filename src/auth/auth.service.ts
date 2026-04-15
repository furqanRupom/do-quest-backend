import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import { IUser } from './interfaces/user.interface';
import { MailService } from '../mail/mail.service';
import mongoose from 'mongoose';
import { generateAccessToken, generateRefreshToken, generateResetToken } from '../common/utils';



@Injectable()
export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService

    ) { }

    private async resetPasswordLink(sub: mongoose.Types.ObjectId, email: string) {
        const resetToken = await generateResetToken(this.jwtService, this.configService, { sub, email })
        const frontendUrl = this.configService.get<string>('frontendUrl');
        return `${frontendUrl}/reset-password?token=${resetToken}`;
    }

    async registerUser(userData: CreateUserDto): Promise<IUser> {
        const result = await this.authRepository.createUser(userData);
        const resetPasswordLink = await this.resetPasswordLink(result._id, result.email);
        await this.mailService.sendEmail({
            subject: 'Welcome to DoQuest!',
            template: 'welcome',
            recipeintEmail: result.email,
            context: {
                name: result.name,
                resetPasswordLink
            },
        })
        return result;
    }
    async loginUser(loginUserDto: LoginUserDto): Promise<{ accessToken: string, refreshToken: string, user: Omit<IUser, 'password'> }> {
        const user = await this.authRepository.findByUsernameOrEmail(loginUserDto.usernameOrEmail);
        if (!user) {
            throw new HttpException('User not found via username or email', HttpStatus.NOT_FOUND);
        }
        const {password, ...userData} = user;
        const isPasswordValid = await user.comparePassword(loginUserDto.password);

        if (!isPasswordValid) {
            throw new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED);
        }
        if (user.needPasswordChange) {
            await this.mailService.sendEmail({
                subject: 'Password Change Required',
                template: 'chanage-password',
                recipeintEmail: user.email,
                context: {
                    name: user.name,
                    resetPasswordLink: await this.resetPasswordLink(user._id, user.email),
                },
            })
            throw new HttpException('Password change required. Check your email.', HttpStatus.FORBIDDEN);
        }
        const payload = { sub: user._id, name: user.name, username: user.username, email: user.email, role: user.role };

        const accessToken = await generateAccessToken(this.jwtService, this.configService, payload)

        const refreshToken = await generateRefreshToken(this.jwtService, this.configService, payload)
        return { accessToken, refreshToken, user: userData };
    }
    async forgotPassword(email: string): Promise<void> {
        const user = await this.authRepository.findByUsernameOrEmail(email);
        if (!user) {
            throw new HttpException('User not found via email', HttpStatus.NOT_FOUND);
        }
        const resetPasswordLink = await this.resetPasswordLink(user._id, user.email);

        this.mailService.sendEmail({
            subject: 'Password Reset',
            template: 'forgot-password',
            recipeintEmail: user.email,
            context: {
                name: user.name,
                resetPasswordLink
            },
        })

    }
    async resetPassword(token: string, newPassword: string): Promise<void> {
        let decoded: { sub: string; email: string };

        try {
            decoded = await this.jwtService.verifyAsync<{ sub: string; email: string }>(token, {
                secret: this.configService.get<string>('resetSecret'),
            });
        } catch (error) {
            throw new HttpException('Invalid or expired reset token', HttpStatus.BAD_REQUEST);
        }

        const user = await this.authRepository.findById(decoded.sub);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        if (user.needPasswordChange) {
            user.needPasswordChange = false;
        }

        user.password = newPassword;
        await user.save();
    }
    async refreshTokens(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
        let decoded: { sub: string; name: string; username: string; email: string; role: string };

        try {
            decoded = await this.jwtService.verifyAsync<{ sub: string; name: string; username: string; email: string; role: string }>(refreshToken, {
                secret: this.configService.get<string>('secretRefreshToken'),
            });
        } catch (error) {
            throw new HttpException('Invalid or expired refresh token', HttpStatus.BAD_REQUEST);
        }

        const payload = { sub: decoded.sub, name: decoded.name, username: decoded.username, email: decoded.email, role: decoded.role };

        const newAccessToken = await generateAccessToken(this.jwtService, this.configService, payload)

        const newRefreshToken = await generateRefreshToken(this.jwtService, this.configService, payload)

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
  

}