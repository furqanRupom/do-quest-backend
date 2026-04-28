import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiResponseDto } from '../../common/dto';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  title?: string = '';

  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string = '';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  successRequirements?: string[] = [];

  @IsOptional()
  @IsString()
  @ApiProperty()
  attachments?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  budget?: number = 0;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  deadline?: string = new Date().toISOString();

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  maxSubmissions?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  categories?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  tags?: string[];
}

export class UpdateWholeTaskDto extends ApiResponseDto<UpdateTaskDto> {
  @ApiProperty({ type: UpdateTaskDto })
  declare data: UpdateTaskDto;
}
