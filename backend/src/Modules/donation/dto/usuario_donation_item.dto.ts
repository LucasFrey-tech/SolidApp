import { ApiProperty } from '@nestjs/swagger';
import { DonacionEstado } from '../enum';

export class UserDonationItemDto {
  @ApiProperty({
    example: '1',
    description: 'ID único de la donación',
  })
  id: number;

  @ApiProperty({
    example: 'Arroz, fideos y enlatados',
    description: 'Detalle de la donación',
  })
  detalle: string;

  @ApiProperty({
    example: 5,
    description: 'Cantidad de articulos',
  })
  cantidad: number;

  @ApiProperty({
    example: 500,
    description: 'Puntos asignados a la donación',
  })
  puntos: number;

  @ApiProperty({
    enum: DonacionEstado,
    example: DonacionEstado.PENDIENTE,
  })
  estado: DonacionEstado;

  @ApiProperty({ example: '20/02/26', description: 'Fecha de la donacion' })
  fecha_registro: Date;

  @ApiProperty({
    example: 'Innovar ONG',
    description: 'Nombre de la organización',
  })
  nombre_organizacion: string;

  @ApiProperty({
    example: 'Campaña Invierno Solidario',
    description: 'Titulo de la campaña',
  })
  titulo_campaña: string;

  @ApiProperty({
    example: '20/02/26',
    description: 'Fecha de cambio de estado',
  })
  fecha_estado?: Date;

  @ApiProperty({
    example: 'Articulos en mal estado',
    description: 'Donación rechazada',
  })
  motivo_rechazo: string;

  @ApiProperty({
    example: 'Calle Falsa',
    description: 'Dirección a la que se donó',
  })
  calle?: string;

  @ApiProperty({
    example: '123',
    description: 'Dirección a la que se donó',
  })
  numero?: string;

  @ApiProperty({
    example: 3,
    description: 'ID de la organización a la que se donó',
  })
  organizacionId: number;

  @ApiProperty({
    example: '21/02/26',
    description: 'Fecha de aprobación de la donación',
  })
  fecha_aprobacion?: Date;

  @ApiProperty({
    example: '22/02/26',
    description: 'Fecha de rechazo de la donación',
  })
  fecha_rechazo?: Date;
}
