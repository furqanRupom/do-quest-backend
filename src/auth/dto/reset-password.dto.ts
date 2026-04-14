import { ApiProperty, ApiResponse } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { ApiResponseDto } from "../../common/dto";

export class ResetPasswordDto {
    @IsString()
    @ApiProperty({example: 'newStrongPassword123!' })
    newPassword: string = 'newStrongPassword123!';
}

export class ResetPasswordResDto {
    @ApiProperty({example:true})
    success: boolean = true;

    @ApiProperty({example:"Password reset successfully"})
    message: string = "Password reset successfully";
}
export class ResetPasswordResponseDto extends ApiResponseDto<ResetPasswordResDto> {
    declare data: null;
}