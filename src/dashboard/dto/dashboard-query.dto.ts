import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DashboardRange {
  DAYS_7 = '7d',
  DAYS_30 = '30d',
  YEAR = '12m',
}

export class DashboardQueryDto {
  @IsOptional()
  @IsEnum(DashboardRange)
  @ApiPropertyOptional({ example: '30d', enum: DashboardRange })
  range?: DashboardRange = DashboardRange.DAYS_30;
}
