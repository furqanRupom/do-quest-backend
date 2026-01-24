import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";
import { ApiResponseDto } from "../../common/dto";
import { Submission } from "../schemas/submission.schema";

export class CreateSubmissionDto {
    @IsString()
    @ApiProperty()
    message: string

    @IsArray()
    @IsString({ each: true })
    @ApiProperty()
    attachments: string[]
}

export class CreateSubmissionResponseDto extends ApiResponseDto<Submission> {
    @ApiProperty({type:Submission})
    declare data: Submission
}
