import { IsBoolean, IsOptional, IsString } from "class-validator";
import { BaseQueryDto } from "../../common/dto";
import { Transform } from "class-transformer";

export class UsersBaseQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsString()
  userStripeId?: string

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  payoutsEnabled?: boolean
}
