import { ApiProperty } from '@nestjs/swagger';

export class OrganizationSummaryDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'Fundación Ayudar' })
  nombre_organizacion: string;

  @ApiProperty({ example: true })
  verificada: boolean;
}
