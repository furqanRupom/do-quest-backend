import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto';
import type { Response } from 'express';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(@Body() createUserDto:CreateUserDto,@Res() res:Response) {
        const result = await this.authService.registerUser(createUserDto);
        return res.status(HttpStatus.CREATED).json({
            success: true,
            message: 'User registered successfully',
            data: result,
        });
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginUserDto:LoginUserDto,@Res() res:Response) {
        const tokens = await this.authService.loginUser(loginUserDto);
        return res.status(HttpStatus.OK).json({
            success: true,
            message: 'User logged in successfully',
            data: tokens,
        });
    }
}
