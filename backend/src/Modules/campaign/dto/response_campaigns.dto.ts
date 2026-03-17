import { ApiProperty } from '@nestjs/swagger';
import { OrganizacionSummaryDto } from '../../organizacion/dto/summary_organizacion.dto';
import { UsuarioResumenDto } from '../../user/dto/response_usuario.dto';

/**
 * DTO para la respuesta de las Campañas.
 */
export class ResponseCampaignsDto {
  @ApiProperty({
    example: 1,
    description: 'Id única de la Campaña Solidaria',
  })
  id: number;

  @ApiProperty({ required: false, nullable: true })
  imagenPortada?: string | null;

  @ApiProperty({
    type: () => OrganizacionSummaryDto,
    description: 'Información resumida de la Organización',
  })
  organizacion: OrganizacionSummaryDto;

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
  descripcion: string;

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

  @ApiProperty({
    example: 75,
    description: 'Puntos por donación a la campaña, por cantidad de articulos',
  })
  puntos: number;

  @ApiProperty({
    description: 'Usuario que creó la campaña',
    type: () => UsuarioResumenDto,
    required: false,
    example: {
      id: 5,
      nombre: 'Juan',
      apellido: 'Pérez',
    },
  })
  creado_por?: UsuarioResumenDto;

  @ApiProperty({
    description: 'Usuario que actualizó la campaña por última vez',
    type: () => UsuarioResumenDto,
    required: false,
    example: {
      id: 5,
      nombre: 'Juan',
      apellido: 'Pérez',
    },
  })
  actualizado_por?: UsuarioResumenDto;

  @ApiProperty({
    example: '2025-05-15T10:30:00.000Z',
    description: 'Fecha de última modificación',
    required: false,
  })
  ultimo_cambio?: Date;
}
