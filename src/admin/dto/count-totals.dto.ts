import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { ApiResponseDto } from "src/common/dto";

export class CountTotalsDto {
    @IsNumber()
    @ApiProperty()
    users: number;
    @IsNumber()
    @ApiProperty()
    submissions: number;
    @IsNumber()
    @ApiProperty()
    tasks: number;
}

export class CountTotalsResponseDto extends ApiResponseDto<CountTotalsDto> {
    @ApiProperty({ type: CountTotalsDto })
    declare data: CountTotalsDto;
}