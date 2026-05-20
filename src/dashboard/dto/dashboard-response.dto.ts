import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { DashboardMetaDto } from './dashboard-meta.dto';

export class DashboardMetaResponseDto extends ApiResponseDto<DashboardMetaDto> {
  @ApiProperty({ type: DashboardMetaDto })
  declare data: DashboardMetaDto;
}
