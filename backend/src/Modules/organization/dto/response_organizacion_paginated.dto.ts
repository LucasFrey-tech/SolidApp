import { ApiProperty } from '@nestjs/swagger';
import { ResponseOrganizationDto } from './response_organizacion.dto';

export class ResponseOrganizationPaginatedDto {
  @ApiProperty({ type: [ResponseOrganizationDto] })
  items: ResponseOrganizationDto[];

  @ApiProperty({ example: 42 })
  total: number;
}
