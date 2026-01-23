import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

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