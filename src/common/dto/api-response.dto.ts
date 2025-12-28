import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Operation completed successfully' })
    message: string;

    data: T | null;
}
