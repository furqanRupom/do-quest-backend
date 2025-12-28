import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import { IUser } from './interfaces/user.interface';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService

    ) { }
    async registerUser(userData: CreateUserDto): Promise<IUser> {
        return await this.authRepository.createUser(userData);
    }
    async loginUser(loginUserDto: LoginUserDto): Promise<{ accessToken: string, refreshToken: string }> {
        const user = await this.authRepository.findByUsernameOrEmail(loginUserDto.usernameOrEmail);
        if (!user) {
            throw new HttpException('User not found via username or email', HttpStatus.NOT_FOUND);
        }
        const isPasswordValid = await user.comparePassword(loginUserDto.password);

        if (!isPasswordValid) {
            throw new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED);
        }
        const payload = { sub: user._id, username: user.username, email: user.email };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('secretAccessToken'),
            expiresIn: this.configService.get<number>('accessTokenExpiry'),
        })

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('secretRefreshToken'),
            expiresIn: this.configService.get<number>('refreshTokenExpiry'),
        })
        return { accessToken, refreshToken };
    }
    async forgotPassword(email: string): Promise<void> {
        const user = await this.authRepository.findByUsernameOrEmail(email);
        if (!user) {
            throw new HttpException('User not found via email', HttpStatus.NOT_FOUND);
        }
        const resetToken = await this.jwtService.signAsync({ sub: user._id, email: user.email }, {
            secret: this.configService.get<string>('resetSecret'),
            expiresIn: this.configService.get<number>('resetTokenExpiry'),
        });
        this.mailService.sendEmail({
            subject: 'Password Reset',
            template: 'forgot-password',
            recipeintEmail: user.email,
            context: {
                name: user.name,
                resetPasswordLink: `http://localhost:3000/reset-password?token=${resetToken}`,
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

        user.password = newPassword;
        await user.save();
    }
}