import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import { IUser } from './interfaces/user.interface';
import { MailService } from '../mail/mail.service';
import mongoose from 'mongoose';
import { UsersService } from '../users/users.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
    private readonly walletService: WalletService,
  ) { }

  private generateAccessToken(payload: Record<string, any>) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('secretAccessToken'),
      expiresIn: this.configService.get<number>('accessTokenExpiry'),
    });
  }

  private generateRefreshToken(payload: Record<string, any>) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('secretRefreshToken'),
      expiresIn: this.configService.get<number>('refreshTokenExpiry'),
    });
  }

  private generateResetToken(payload: Record<string, any>) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('resetSecret'),
      expiresIn: this.configService.get<number>('resetTokenExpiry'),
    });
  }

  private async resetPasswordLink(sub: mongoose.Types.ObjectId, email: string) {
    const resetToken = await this.generateResetToken({ sub, email });

    const frontendUrl = this.configService.get<string>('frontendUrl');

    return `${frontendUrl}/reset-password?token=${resetToken}`;
  }

  async registerUser(userData: CreateUserDto): Promise<IUser> {
    const result = await this.usersService.createUser(userData)
    await this.walletService.createWallet(result._id)
    return result;
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Omit<IUser, 'password'>;
  }> {
    const isUserExists = await this.usersService.findByUsernameOrEmail(
      loginUserDto.usernameOrEmail,
    );

    if (!isUserExists) {
      throw new HttpException(
        'User not found via username or email',
        HttpStatus.NOT_FOUND,
      );
    }
    if (isUserExists.isDeleted) {
      throw new HttpException(
        "Account has been deleted. Please contact our support team.",
        HttpStatus.BAD_REQUEST
      )
    }
    const isPasswordValid = await isUserExists.comparePassword(
      loginUserDto.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED);
    }

    const user = isUserExists.toObject();
    const { password, ...userData } = user;

    const payload = {
      sub: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      userStripeId: user.userStripeId
    };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: userData,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByUsernameOrEmail(email);

    if (!user) {
      throw new HttpException('User not found via email', HttpStatus.NOT_FOUND);
    }

    const resetLink = await this.resetPasswordLink(user._id, user.email);

    await this.mailService.sendEmail({
      subject: 'Password Reset',
      template: 'forgot-password',
      recipeintEmail: user.email,
      context: {
        name: user.name,
        resetPasswordLink: resetLink,
      },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    let decoded: { sub: string; email: string };

    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('resetSecret'),
      });
    } catch (error) {
      throw new HttpException(
        'Invalid or expired reset token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.usersService.findById(decoded.sub);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.password = newPassword;
    user.needPasswordChange = false;

    await user.save();
  }

  async resetPasswordChange(
    email: string,
    dto: { currentPassword: string; newPassword: string },
  ) {
    const IsUserExits = await this.usersService.findByUsernameOrEmail(email);
    if (!IsUserExits) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await IsUserExits.comparePassword(
      dto.currentPassword,
    );

    if (!isPasswordValid) {
      throw new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED);
    }

    IsUserExits.password = dto.newPassword;
    IsUserExits.needPasswordChange = false;
    IsUserExits.save();
    return null;
  }

  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    let decoded: {
      sub: string;
      name: string;
      username: string;
      email: string;
      role: string;
      userStripeId: string;
    };

    try {
      decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('secretRefreshToken'),
      });
    } catch (error) {
      throw new HttpException(
        'Invalid or expired refresh token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = {
      sub: decoded.sub,
      name: decoded.name,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      userStripeId: decoded.userStripeId
    };

    const newAccessToken = await this.generateAccessToken(payload);

    const newRefreshToken = await this.generateRefreshToken(payload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
