import { IsString,IsNotEmpty } from "class-validator"
import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "../../common/dto/api-response.dto";

export class LoginUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'johndoe or john.doe@example.com' })
    usernameOrEmail:string
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'strongPassword123' })
    password:string
}

export class LoginTokensDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' })
    accessToken: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' })
    refreshToken: string;
}
export class LoginResponseDto extends ApiResponseDto<LoginTokensDto> {
    @ApiProperty({ type: LoginTokensDto })
    declare data: LoginTokensDto;
}



