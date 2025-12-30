import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";
import { ApiResponseDto } from "../../common/dto";

export class ChangePasswordDto {
    @IsString()
    @ApiProperty({ example: 'CurrentPass123!' })
    currentPassword: string;
    @IsString()
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character (@$!%*?&), and be at least 8 characters long',
        }
    )
    @ApiProperty({
        example: 'NewStrongPass123!',
        description: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and minimum 8 characters'
    })
    newPassword: string;
}


export class ChangePasswordResponseDto extends ApiResponseDto<null> {}