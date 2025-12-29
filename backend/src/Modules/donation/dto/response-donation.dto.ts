import { ApiProperty } from '@nestjs/swagger';

export class ResponseDonationDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la donación',
  })
  id: number;

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
    example: 'CONFIRMADA',
    description: 'Estado actual de la donación',
  })
  estado: string;

  @ApiProperty({
    example: 3,
    description: 'Identificador de la campaña solidaria asociada a la donación',
  })
  campaignId: number;

  @ApiProperty({
    example: 12,
    description: 'Identificador del usuario (donador) que realizó la donación',
  })
  donorId: number;
}
