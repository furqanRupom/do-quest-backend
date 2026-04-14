import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "../../common/dto/api-response.dto";
import mongoose from "mongoose";
export class CreateUserDto {
@IsString()
    @ApiProperty({ example: 'John Doe' })
    name: string = 'John Doe';
    
    @IsString()
    @ApiProperty({ example: 'johndoe' })
    username: string = 'johndoe';

    @IsEmail()
    @ApiProperty({ example: 'john.doe@example.com' })
    email: string = 'john.doe@example.com';

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character (@$!%*?&), and be at least 8 characters long',
        }
    )
    @ApiProperty({
        example: 'StrongPass123!',
        description: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and minimum 8 characters'
    })
    password: string = 'StrongPass123!';
    needPasswordChange: boolean = false;
}

export class UserResponseDto {
    @ApiProperty({example:"64a7b2f5c9e4f2a1b3d6e7f8"})
    @IsString()
    _id:mongoose.Types.ObjectId = new mongoose.Types.ObjectId();
    
    @ApiProperty({example:"John Doe"})
    @IsString()
    username:string = 'John Doe';

    @ApiProperty({example:"johndoe@example.com"})
    @IsString()
    email:string = 'john.doe@example.com';

    @ApiProperty({example:"user"})
    role:string = 'user';

    @ApiProperty()
    location?:string;

    @ApiProperty()
    company?:string;

    @ApiProperty({type:[String]})
    socialLinks?:string[];
    needPasswordChange: boolean = false;
}

export class createUserResponseDto extends ApiResponseDto<UserResponseDto> {
    @ApiProperty({ type: UserResponseDto })
    declare data: UserResponseDto;
}