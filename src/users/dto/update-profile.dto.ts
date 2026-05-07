import { ApiProperty } from '@nestjs/swagger';
import { IsArray, isArray, IsEmail, IsString } from 'class-validator';
import mongoose from 'mongoose';
import { ApiResponseDto } from '../../common/dto';

export class UserResponseDto {
    @ApiProperty()
    _id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId();

    @ApiProperty()
    @IsString()
    name: string = '';

    @ApiProperty()
    username: string = '';

    @ApiProperty()
    email: string = '';

    @ApiProperty()
    role: string = '';

    @ApiProperty()
    location?: string = '';

    @ApiProperty()
    company?: string

    @ApiProperty({ type: [String] })
    socialLinks?: string[];


}

export class UpdateUserDto {
    @ApiProperty()
    @IsString()
    name?:string

    @ApiProperty()
    @IsString()
    username?:string
    
    @ApiProperty()
    @IsString()
    @IsEmail()
    email?:string

    @ApiProperty()
    @IsString()
    location?: string

    @ApiProperty()
    @IsString()
    company?: string

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({each: true})
    socialLinks?: string[];

}

export class UserProfileResponseDto extends ApiResponseDto<UserResponseDto> {
    @ApiProperty({ type: UserResponseDto })
    declare data: UserResponseDto | null
}

export class UpdateProfileResponseDto extends ApiResponseDto<UpdateUserDto>{
    @ApiProperty({ type: UpdateUserDto })
    declare data: UpdateUserDto | null
}
