import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateNewTaskDto {
    @IsString()
    @ApiProperty()
    title:string

    @IsString()
    @ApiProperty()
    description:string

    @IsArray()
    @IsString({each:true})
    @ApiProperty()
    successRequirements:string[]

    @IsString()
    @ApiProperty()
    attachments?:string

    @IsNumber()
    @ApiProperty()
    budget:number
    
    @IsDateString()
    @ApiProperty()
    deadline:string

    @IsOptional()
    @IsNumber()
    @ApiProperty()
    maxSubmissions?: number

    @IsArray()
    @IsString({each:true})
    @ApiProperty()
    categories: string[]

    @IsOptional()
    @IsArray()
    @IsString({each:true})
    @ApiProperty()
    tags?: string[]

}