import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { ApiResponseDto } from "../../common/dto";

export class CountTotalsDto {
    @IsNumber()
    @ApiProperty()
    users: number = 0;
    @IsNumber()
    @ApiProperty()
    submissions: number = 0;
    @IsNumber()
    @ApiProperty()
    tasks: number = 0;
}

export class CountTotalsResponseDto extends ApiResponseDto<CountTotalsDto> {
    @ApiProperty({ type: CountTotalsDto })
    declare data: CountTotalsDto;
}