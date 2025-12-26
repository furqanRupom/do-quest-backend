import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, createUserResponseDto } from './dto';
import { LoginResponseDto, LoginUserDto } from './dto/login-user.dto';
import {ApiOkResponse} from '@nestjs/swagger';
import { sendResponse } from '../common/utils';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    @ApiOkResponse({type: createUserResponseDto})
    async register(@Body() createUserDto:CreateUserDto):Promise<createUserResponseDto> {
        const result = await this.authService.registerUser(createUserDto);
        return sendResponse({
            success: true,
            message: 'User registered successfully',
            data: result,
        });
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiOkResponse({type: LoginResponseDto})
    async login(@Body() loginUserDto:LoginUserDto):Promise<LoginResponseDto> {
        const result =  await this.authService.loginUser(loginUserDto);
        return sendResponse({
            success: true,
            message: 'User logged in successfully',
            data: result,
        });
       
    }
}
