import { ApiProperty } from '@nestjs/swagger';

export class DashboardMetaDto {
  @ApiProperty()
  worker: any;

  @ApiProperty()
  owner: any;

  @ApiProperty()
  wallet: any;
}
