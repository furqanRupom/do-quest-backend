import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiMetaResponseDto, BaseQueryDto } from "../../common/dto";
import { PaymentFlowStatus, PaymentStatus, TaskStatus } from "../enums/tasks.enum";
import { Type } from "class-transformer"
export class GetAllTaskDto<T> extends ApiMetaResponseDto<Partial<T>> {
  declare data: Partial<T>[];
}
export class GetTasksQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentFlowStatus)
  paymentFlowStatus?: PaymentFlowStatus;

  @IsOptional()
  @IsString()
  categories?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @IsDateString()
  deadlineMin?: string;

  @IsOptional()
  @IsDateString()
  deadlineMax?: string;
}
