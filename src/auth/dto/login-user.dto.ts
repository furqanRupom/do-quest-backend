import { IsString, IsNotEmpty } from "class-validator"
import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "../../common/dto/api-response.dto";
import { IUser } from "../interfaces/user.interface";

export class LoginUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'johndoe or john.doe@example.com' })
    usernameOrEmail: string = '';
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'StrongPassword123!' })
    password: string = ''
}

export class LoginTokensDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' })
    accessToken: string = '';

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' })
    refreshToken: string = '';

    @ApiProperty({ example: { _id: '60c72b2f9b1d8e5a5c8f9b1', name: 'John Doe', email: 'john.doe@example.com', username: 'johndoe', role: 'user' } })
    user: Omit<IUser, 'password'> = {} as Omit<IUser, 'password'>;

}
export class LoginResponseDto extends ApiResponseDto<LoginTokensDto> {
    @ApiProperty({ type: LoginTokensDto })
    declare data: LoginTokensDto;
}



