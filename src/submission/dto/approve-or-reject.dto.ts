import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { ApiResponseDto } from "../../common/dto";

export class ApproveOrRejectDto {
    @IsString()
    @ApiProperty()
    taskId: string;

    @IsString()
    @ApiProperty()
    approverId: string;

    @IsString()
    @ApiProperty()
    submissionId: string;
}


class ApproveDto {
    capturedAmount: number;
    winnerSubmissionId: string;
}

export class ApproveResponseDto extends ApiResponseDto<ApproveDto>{
    declare data: ApproveDto;
}
export class RejectResponseDto extends ApiResponseDto<null>{
    declare data: null;
}