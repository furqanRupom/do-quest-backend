import { IsBoolean, IsOptional, IsString } from "class-validator";
import { BaseQueryDto } from "../../common/dto";

export class UsersBaseQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsString()
  userStripeId?: string

  @IsOptional()
  @IsBoolean()
  payoutsEnabled?: boolean
}
