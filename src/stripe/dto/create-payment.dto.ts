import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsOptional, IsObject } from "class-validator";

export class CreatePaymentDto {
    @IsNumber()
    @ApiProperty()
    amount: number;

    @ApiProperty()
    @IsString()
    currency: string;

    @IsOptional()
    @IsObject()
    @ApiProperty({
        required: false,
        type: Object,
        additionalProperties: { type: 'string' }, 
        example: { orderId: '123', customer: 'abc' },
    })
    metadata?: Record<string, string>;
}
