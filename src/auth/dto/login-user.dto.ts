import { IsString } from "class-validator"

export class LoginUserDto {
    @IsString()
    usernameOrEmail:string
    @IsString()
    password:string
}