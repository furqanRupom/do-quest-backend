import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RefreshTokenDto {
    @ApiProperty({example: 'eyJhbGc...', description: 'Refresh token string' })
    @IsString()
    refreshToken: string;
}