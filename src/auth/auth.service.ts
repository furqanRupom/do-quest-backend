import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import { IUser } from './interfaces/user.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}
    async registerUser(userData: CreateUserDto): Promise<IUser> {
        return await this.authRepository.createUser(userData);
    }
    async loginUser(loginUserDto: LoginUserDto):Promise<{accessToken:string,refreshToken:string}> {
        const user = await this.authRepository.findByUsernameOrEmail(loginUserDto.usernameOrEmail);
        if (!user) {
            throw new HttpException('User not found via username or email', HttpStatus.NOT_FOUND);
        }
        const isPasswordValid = await user.comparePassword(loginUserDto.password);
        
        if (!isPasswordValid) {
            throw new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED);
        }
        const payload = { sub: user._id, username: user.username, email: user.email };

        const accessToken = await this.jwtService.signAsync(payload,{
            secret: this.configService.get<string>('secretAccessToken'),
            expiresIn: this.configService.get<number>('accessTokenExpiry'),
        })

        const refreshToken = await this.jwtService.signAsync(payload,{
            secret: this.configService.get<string>('secretRefreshToken'),
            expiresIn: this.configService.get<number>('refreshTokenExpiry'),
        })
        return {accessToken, refreshToken};
    }
}