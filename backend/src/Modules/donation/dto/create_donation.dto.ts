import { ApiProperty } from '@nestjs/swagger';
import { DonacionEstado } from '../enum';
import { IsEnum } from 'class-validator';

/**
 * DTO para la creación de Donaciones.
 * Contiene las validaciones para los campos del cuerpo de la petición.
 */
export class CreateDonationDto {
  /** Título de la Donación */
  @ApiProperty({
    example: 'Donación de alimentos no perecederos',
    description: 'Título o nombre identificatorio de la donación',
  })
  titulo: string;

  /** Descripción de la Donación */
  @ApiProperty({
    example: 'Arroz, fideos y enlatados',
    description: 'Detalle o descripción de la donación realizada',
  })
  detalle: string;

  /** Tipo de la Donación */
  @ApiProperty({
    example: 'ALIMENTO',
    description: 'Tipo de donación (ALIMENTO, ROPA, DINERO, INSUMOS)',
  })
  tipo: string;

  /** Cantidad de unidades donadas */
  @ApiProperty({
    example: 10,
    description: 'Cantidad de unidades donadas',
  })
  cantidad: number;

  /** Estado de la Donación */
  @ApiProperty({
    example: 'PENDIENTE',
    description:
      'Estado actual de la donación (PENDIENTE, CONFIRMADA, ENTREGADA)',
  })
  @IsEnum(DonacionEstado)
  estado: DonacionEstado;

  /** ID de la Campaña asociada */
  @ApiProperty({
    example: 3,
    description: 'Identificador de la campaña solidaria asociada a la donación',
  })
  campaignId: number;
}
