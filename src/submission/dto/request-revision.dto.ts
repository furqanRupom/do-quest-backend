import { IsString } from "class-validator";

export class RequestRevisionDto {
  @IsString()
  revisionNote:string = ''
}
