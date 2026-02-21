import { ApiProperty } from '@nestjs/swagger';
import { DonacionEstado } from '../enum';

/**
 * DTO de la Donación.
 */
export class OrganizationDonationItemDto {
  /** ID de la Donación */
  @ApiProperty({ example: 15 })
  id: number;

  /** Descripcion de la Donación */
  @ApiProperty({
    example: 'Arroz, fideos y enlatados',
    description: 'Detalle de la donación',
  })
  descripcion: string;

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

  /** ID del Usuario asociado */
  @ApiProperty({ example: 12 })
  userId: number;

  /** Correo Electronico del Usuario asociado */
  @ApiProperty({ example: 'usuario@mail.com' })
  correo: string;

  /** ID de la Campaña asociada */
  @ApiProperty({ example: 3 })
  campaignId: number;

  /** Título de la Campaañ asociada */
  @ApiProperty({ example: 'Campaña Invierno Solidario' })
  campaignTitulo: string;

  /** Fecha en la que cambio de estado */
  @ApiProperty({ example: '20/02/26' })
  fecha_estado?: Date;

  @ApiProperty({ example: "objetivo"})
  cantidad: number;
}
