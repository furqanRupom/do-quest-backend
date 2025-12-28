import { ApiProperty, ApiResponse } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { ApiResponseDto } from "../../common/dto";

export class ResetPasswordDto {
    @IsString()
    @ApiProperty({example: 'eyJhb..' })
    token: string;
    @IsString()
    @ApiProperty({example: 'newStrongPassword123!' })
    newPassword: string;
}

export class ResetPasswordResDto {
    @ApiProperty({example:true})
    success: boolean;

    @ApiProperty({example:"Password reset successfully"})
    message: string;
}
export class ResetPasswordResponseDto extends ApiResponseDto<ResetPasswordResDto> {
    declare data: null;
}