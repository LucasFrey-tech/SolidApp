import { ApiProperty } from '@nestjs/swagger';
import { DonacionEstado } from '../enum';

/**
 * DTO de la Donación.
 */
export class UserDonationItemDto {
  /** Descripcion de la Donación */
  @ApiProperty({
    example: 'Arroz, fideos y enlatados',
    description: 'Detalle de la donación',
  })
  detalle: string;

  /** Cantidad de articulos donados */
  @ApiProperty({
    example: 5,
    description: 'Cantidad de articulos',
  })
  cantidad: number;

  /** Puntos asignados de la Donación */
  @ApiProperty({
    example: 500,
    description: 'Puntos asignados a la donación',
  })
  puntos: number;

  /** Estado de la Donación */
  @ApiProperty({
    enum: DonacionEstado,
    example: DonacionEstado.PENDIENTE,
  })
  estado: DonacionEstado;

  /** Fecha en la cual se realizo la donación */
  @ApiProperty({ example: '20/02/26', description: 'Fecha de la donacion' })
  fecha_Registro: Date;

  /** Título de la Campaañ asociada */
  @ApiProperty({
    example: 'Campaña Invierno Solidario',
    description: 'Titulo de la campaña',
  })
  tituloCampaña: string;

  /** Fecha en la que cambio de estado */
  @ApiProperty({
    example: '20/02/26',
    description: 'Fecha de cambio de estado',
  })
  fecha_estado?: Date;

  /** El motivo que indica el por qué del rechazo de la donación */
  @ApiProperty({
    example: 'Articulos en mal estado',
    description: 'Donación rechazada',
  })
  motivo_rechazo: string;
}
