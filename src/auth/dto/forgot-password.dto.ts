import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { ApiResponseDto } from "../../common/dto/api-response.dto";

export class ForgotPasswordDto {
    @ApiProperty({example:"user@example.com"})
    @IsString()
    email: string;
}
export class ForgotPasswordResDto {
    @ApiProperty({example:true})
    success: boolean;

    @ApiProperty({example:"Password reset email sent successfully"})
    message: string;
}

export class ForgotPasswordResponseDto extends ApiResponseDto<ForgotPasswordResDto> {
}