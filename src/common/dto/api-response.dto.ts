import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ApiResponseDto<T> {
    @ApiProperty({ example: true })
    success: boolean = true;

    @ApiProperty({ example: 'Operation completed successfully' })
    message: string = 'Operation completed successfully';

    data: T | null = null;
}

export class PaginationMetaDto {
    @ApiProperty({ example: 1 })
    page: number = 1;

    @ApiProperty({ example: 10 })
    limit: number = 10;

    @ApiProperty({ example: 100 })
    total: number = 0;

    @ApiProperty({ example: 10 })
    totalPages: number = 0;
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
    meta: PaginationMetaDto = new PaginationMetaDto();

    @ApiProperty({ isArray: true })
    declare data: T[];
}

export class ListResponseDto<T> extends ApiMetaResponseDto<Partial<T>> {
    declare data: Partial<T>[];
}
