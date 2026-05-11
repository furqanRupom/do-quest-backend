import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiResponseDto, BaseQueryDto } from "../../common/dto";
import { Submission } from "../schemas/submission.schema";
import { ApiProperty } from "@nestjs/swagger";
import { SubmissionStatus } from "../enums/submission.enum";

export class SubmissionListDto extends ApiResponseDto<Submission[]> {
  @ApiProperty({ type: [Submission] })
  declare data: Submission[]
}
export class SubmissionQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus

  @IsOptional()
  @IsString()
  task?: string

  @IsOptional()
  @IsString()
  stripeTransferId?: string
}
