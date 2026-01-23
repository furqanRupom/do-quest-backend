import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class CreateSubmissionDto {
    @IsString()
    @ApiProperty()
    message: string

    @IsArray()
    @IsString({ each: true })
    @ApiProperty()
    attachments: string[]
}