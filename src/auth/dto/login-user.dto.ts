import { IsString,IsNotEmpty } from "class-validator"

export class LoginUserDto {
    @IsString()
    @IsNotEmpty()
    usernameOrEmail:string
    @IsString()
    @IsNotEmpty()
    password:string
}