import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { ApiResponseDto } from "../../common/dto/api-response.dto";

export class RefreshTokenDto {
    @ApiProperty({ example: 'eyJhbGc...', description: 'Refresh token string' })
    @IsString()
    refreshToken: string = '';
}
export class RefreshTokenResponseDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' })
    accessToken: string = '';

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' })
    refreshToken: string = '';
}

export class RefreshTokenApiResponseDto extends ApiResponseDto<RefreshTokenResponseDto> {
    declare data: RefreshTokenResponseDto;
}