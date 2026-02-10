import { ApiProperty } from '@nestjs/swagger';
import { DonacionEstado } from '../enum';

export class OrganizationDonationItemDto {
  @ApiProperty({ example: 15 })
  id: number;

  @ApiProperty({
    example: 'Arroz, fideos y enlatados',
    description: 'Detalle de la donación',
  })
  descripcion: string;

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

  @ApiProperty({ example: 12 })
  userId: number;

  @ApiProperty({ example: 'usuario@mail.com' })
  correo: string;

  @ApiProperty({ example: 3 })
  campaignId: number;

  @ApiProperty({ example: 'Campaña Invierno Solidario' })
  campaignTitulo: string;
}
