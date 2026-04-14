import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

export async function generateAccessToken<T>(jwt: JwtService, config: ConfigService, payload: Record<string, any>): Promise<string> {
    return await jwt.signAsync(payload, {
        secret: config.get<string>('secretAccessToken'),
        expiresIn: config.get<number>('accessTokenExpiry'),
    })
}

export async function generateRefreshToken<T>(jwt: JwtService, config: ConfigService, payload: Record<string, any>): Promise<string> {
    return await jwt.signAsync(payload, {
        secret: config.get<string>('secretRefreshToken'),
        expiresIn: config.get<number>('refreshTokenExpiry'),
    })
}

export async function generateResetToken<T>(jwt: JwtService, config: ConfigService, payload: Record<string, any>): Promise<string> {
    return await jwt.signAsync(payload, {
        secret: config.get<string>('resetSecret'),
        expiresIn: config.get<number>('resetTokenExpiry'),
    })
}