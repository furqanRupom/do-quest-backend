import { ApiResponseDto } from "../../common/dto";
import { Submission } from "../schemas/submission.schema";
import { ApiProperty } from "@nestjs/swagger";

export class SubmissionListDto extends ApiResponseDto<Submission[]> {
    @ApiProperty({ type: [Submission] })
    declare data: Submission[]
}