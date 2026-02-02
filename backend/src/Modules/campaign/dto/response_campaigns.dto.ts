import { ApiProperty } from '@nestjs/swagger';
import { OrganizationSummaryDto } from '../../organization/dto/summary_organization.dto';

export class ResponseCampaignsDto {
  @ApiProperty({
    example: 1,
    description: 'Id única de la Campaña Solidaria',
  })
  id: number;

  @ApiProperty({
    type: () => OrganizationSummaryDto,
    description: 'Información resumida de la Organización',
  })
  organizacion: OrganizationSummaryDto;

  @ApiProperty({
    example: 'Campaña Solidaria Invierno 2025',
    description: 'Título de la campaña solidaria',
  })
  titulo: string;

  @ApiProperty({
    example: 'ACTIVA',
    description: 'Estado actual de la campaña solidaria',
  })
  estado?: string;

  @ApiProperty({
    example: 'Campaña destinada a la recolección de ropa de abrigo',
    description: 'Descripción detallada de la campaña solidaria',
  })
  description: string;

  @ApiProperty({
    example: '2025-06-01',
    description: 'Fecha de inicio de la campaña',
    type: String,
    format: 'date',
  })
  fecha_Inicio: Date;

  @ApiProperty({
    example: '2025-08-31',
    description: 'Fecha de finalización de la campaña',
    type: String,
    format: 'date',
  })
  fecha_Fin: Date;

  @ApiProperty({
    example: '2025-05-15',
    description: 'Fecha de registro de la campaña en el sistema',
    type: String,
    format: 'date',
  })
  fecha_Registro: Date;

  @ApiProperty({
    example: 500000,
    description: 'Monto objetivo de recaudación de la campaña solidaria',
  })
  objetivo: number;
}
