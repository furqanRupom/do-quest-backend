import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class BaseQueryDto {
    @ApiPropertyOptional({ description: 'Search term for filtering results' })
    @IsOptional()
    @IsString()
    searchTerm?: string;

    @ApiPropertyOptional({ description: 'Sort fields, comma separated' })
    @IsOptional()
    @IsString()
    sort?: string;

    @ApiPropertyOptional({ description: 'Page number', default: 1 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Fields to select, comma separated' })
    @IsOptional()
    @IsString()
    fields?: string;
}
