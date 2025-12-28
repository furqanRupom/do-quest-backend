import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh',
) {
    constructor(configService: ConfigService) {
        const secret = configService.get<string>('secretRefreshToken');

        if (!secret) {
            throw new Error(
                'secretRefreshToken is not defined in environment variables',
            );
        }
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            secretOrKey: secret,
            passReqToCallback: false,
        });
    }

    async validate(payload: {
        sub: string;
        username: string;
        email: string;
        role: string;
    }) {
        if (!payload) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return {
            userId: payload.sub,
            username: payload.username,
            email: payload.email,
            role: payload.role,
        };
    }
}
