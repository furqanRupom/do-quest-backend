import { IsOptional, IsString } from "class-validator";

export class DashboardGraphDto {
  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  count?: number;

  @IsOptional()
  @IsString()
  amount?: number;
}
