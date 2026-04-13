import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { ApiResponseDto } from "../../common/dto";
import { TaskStatus } from "../enums/tasks.enum";

export class CreateNewTaskDto {
    @IsString()
    @ApiProperty()
    title: string = ''

    @IsString()
    @ApiProperty()
    description: string = ''

    @IsArray()
    @IsString({ each: true })
    @ApiProperty()
    successRequirements: string[] = []

    @IsString()
    @ApiProperty()
    attachments?: string

    @IsNumber()
    @ApiProperty() 
    budget: number = 0;

    @IsDateString()
    @ApiProperty()
    deadline: string = new Date().toISOString();

    @IsOptional()
    @IsNumber()
    @ApiProperty()
    maxSubmissions?: number

    @IsArray()
    @IsString({ each: true })
    @ApiProperty()
    categories: string[] = []

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiProperty()
    tags?: string[]

}

export class CreateTaskResponseDto extends CreateNewTaskDto {
    @ApiProperty()
    _id: Types.ObjectId = new Types.ObjectId();
    status: TaskStatus = TaskStatus.active;
    paymentIntentId?: string
    clientSecret?: string | null
}

export class CreateNewTaskResponseDto extends ApiResponseDto<CreateTaskResponseDto> {
    @ApiProperty({type:CreateTaskResponseDto})
    declare data: CreateTaskResponseDto
}

