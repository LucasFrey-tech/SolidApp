import { ApiProperty } from '@nestjs/swagger';
import { OrganizationSummaryDto } from '../../organization/dto/summary_organization.dto';

/**
 * DTO para la respuesta de las Campañas.
 */
export class ResponseCampaignsDto {
  /** ID de la Campaña */
  @ApiProperty({
    example: 1,
    description: 'Id única de la Campaña Solidaria',
  })
  id: number;

  /** Imagen de la campaña */
  @ApiProperty({ required: false, nullable: true })
  imagenPortada?: string | null;

  /** Datos de la Organización asociada */
  @ApiProperty({
    type: () => OrganizationSummaryDto,
    description: 'Información resumida de la Organización',
  })
  organizacion: OrganizationSummaryDto;

  /** Título de la Campaña */
  @ApiProperty({
    example: 'Campaña Solidaria Invierno 2025',
    description: 'Título de la campaña solidaria',
  })
  titulo: string;

  /** Estado de la Campaña */
  @ApiProperty({
    example: 'ACTIVA',
    description: 'Estado actual de la campaña solidaria',
  })
  estado?: string;

  /** Descripción de la Campaña */
  @ApiProperty({
    example: 'Campaña destinada a la recolección de ropa de abrigo',
    description: 'Descripción detallada de la campaña solidaria',
  })
  description: string;

  /** Fecha de Inicio de la Campaña */
  @ApiProperty({
    example: '2025-06-01',
    description: 'Fecha de inicio de la campaña',
    type: String,
    format: 'date',
  })
  fecha_Inicio: Date;

  /** Fecha de Finalización de la Campaña */
  @ApiProperty({
    example: '2025-08-31',
    description: 'Fecha de finalización de la campaña',
    type: String,
    format: 'date',
  })
  fecha_Fin: Date;

  /** Fecha de Registro en el sistema de la Campaña */
  @ApiProperty({
    example: '2025-05-15',
    description: 'Fecha de registro de la campaña en el sistema',
    type: String,
    format: 'date',
  })
  fecha_Registro: Date;

  /** Cantidad a recaudar */
  @ApiProperty({
    example: 500000,
    description: 'Monto objetivo de recaudación de la campaña solidaria',
  })
  objetivo: number;
}
