import { ApiProperty } from '@nestjs/swagger';
import { ResponseOrganizacionDto } from './response_organizacion.dto';

export class ResponseOrganizationPaginatedDto {
  @ApiProperty({ type: [ResponseOrganizacionDto] })
  items: ResponseOrganizacionDto[];

  @ApiProperty({ example: 42 })
  total: number;
}
