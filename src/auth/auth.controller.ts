import { Body, Controller, Header, Headers, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, createUserResponseDto, ForgotPasswordDto, ForgotPasswordResponseDto } from './dto';
import { LoginResponseDto, LoginUserDto } from './dto/login-user.dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { sendResponse } from '../common/utils';
import { ResetPasswordDto, ResetPasswordResponseDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { Roles } from 'src/common/decorators';
import { UserRole } from 'src/common/enums';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    @ApiOkResponse({ type: createUserResponseDto })
    async register(@Body() createUserDto: CreateUserDto): Promise<createUserResponseDto> {
        const result = await this.authService.registerUser(createUserDto);
        return sendResponse({
            success: true,
            message: 'User registered successfully',
            data: result,
        });
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiOkResponse({ type: LoginResponseDto })
    async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
        const result = await this.authService.loginUser(loginUserDto);
        return sendResponse({
            success: true,
            message: 'User logged in successfully',
            data: result,
        });
    }
    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    @ApiOkResponse({ type: ForgotPasswordResponseDto })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
        await this.authService.forgotPassword(forgotPasswordDto.email);
        return sendResponse({
            success: true,
            message: 'Password reset email sent successfully',
            data: null,
        });
    }

    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    @ApiOkResponse({ type: ResetPasswordResponseDto })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
        await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
        return sendResponse({
            success: true,
            message: 'Password reset successfully',
            data: null,
        });
    }
    @UseGuards(RefreshAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('refresh-token')
    @ApiBearerAuth('refresh-token')
    @ApiOkResponse({ type: LoginResponseDto })
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<LoginResponseDto> {
        const result = await this.authService.refreshTokens(refreshTokenDto.refreshToken);
        return sendResponse({
            success: true,
            message: 'Token refreshed successfully',
            data: result,
        });
    }
}
