import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "../../common/dto/api-response.dto";
import mongoose from "mongoose";
export class CreateUserDto {
    @IsString()
    @ApiProperty({ example: 'John Doe' })
    name: string;
    
    @IsString()
    @ApiProperty({ example: 'johndoe' })
    username: string;

    @IsEmail()
    @ApiProperty({ example: 'john.doe@example.com' })
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'strongPassword123' })
    password: string;
}

export class UserResponseDto {
    @ApiProperty({example:"64a7b2f5c9e4f2a1b3d6e7f8"})
    @IsString()
    _id:mongoose.Types.ObjectId;
    
    @ApiProperty({example:"John Doe"})
    @IsString()
    username:string;

    @ApiProperty({example:"johndoe@example.com"})
    @IsString()
    email:string;

    @ApiProperty({example:"user"})
    role:string;

    @ApiProperty()
    location?:string;

    @ApiProperty()
    company?:string;

    @ApiProperty({type:[String]})
    socialLinks?:string[];

}

export class createUserResponseDto extends ApiResponseDto<UserResponseDto> {
    @ApiProperty({ type: UserResponseDto })
    declare data: UserResponseDto;
}