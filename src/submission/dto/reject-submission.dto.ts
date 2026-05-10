import { IsString } from "class-validator";

export class RejectSubmissionDto {
  @IsString()
  rejectionReason:string = ''
}
