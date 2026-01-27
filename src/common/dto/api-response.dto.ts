import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ApiResponseDto<T> {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Operation completed successfully' })
    message: string;

    data: T | null;
}

export class PaginationMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 100 })
    total: number;

    @ApiProperty({ example: 10 })
    totalPage: number;
}

export class ApiMetaResponseDto<T> extends ApiResponseDto<T[]> {
    @ApiProperty({ type: () => PaginationMetaDto })
    @IsOptional()
    meta?: PaginationMetaDto;

    @ApiProperty({ isArray: true })
    declare data: T[];
}


export class MetaResponseDto<T> {
    @ApiProperty({ type: () => PaginationMetaDto })
    meta: PaginationMetaDto;

    @ApiProperty({ isArray: true })
    declare data: T[];
}

export class ListResponseDto<T> extends ApiMetaResponseDto<Partial<T>> {
    declare data: Partial<T>[];
}