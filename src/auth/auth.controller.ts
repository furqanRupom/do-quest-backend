import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(@Body() createUserDto:CreateUserDto,@Res() res:Response) {
        const result = await this.authService.registerUser(createUserDto);
        return res.status(HttpStatus.CREATED).json({
            message: 'User registered successfully',
            data: result,
        });

    }
}
