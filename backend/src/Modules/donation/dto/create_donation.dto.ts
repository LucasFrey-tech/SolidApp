import { ApiProperty } from '@nestjs/swagger';
import { DonacionEstado } from '../enum';
import { IsEnum } from 'class-validator';

export class CreateDonationDto {
  @ApiProperty({
    example: 'Donación de alimentos no perecederos',
    description: 'Título o nombre identificatorio de la donación',
  })
  titulo: string;

  @ApiProperty({
    example: 'Arroz, fideos y enlatados',
    description: 'Detalle o descripción de la donación realizada',
  })
  detalle: string;

  @ApiProperty({
    example: 'ALIMENTO',
    description: 'Tipo de donación (ALIMENTO, ROPA, DINERO, INSUMOS)',
  })
  tipo: string;

  @ApiProperty({
    example: 10,
    description: 'Cantidad de unidades donadas',
  })
  cantidad: number;

  @ApiProperty({
    example: 'PENDIENTE',
    description:
      'Estado actual de la donación (PENDIENTE, CONFIRMADA, ENTREGADA)',
  })
  @IsEnum(DonacionEstado)
  estado: DonacionEstado;

  @ApiProperty({
    example: 3,
    description: 'Identificador de la campaña solidaria asociada a la donación',
  })
  campaignId: number;
}
