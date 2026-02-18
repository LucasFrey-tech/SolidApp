import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para la creación de Donaciones.
 * Contiene las validaciones para los campos del cuerpo de la petición.
 */
export class CreateDonationDto {
  /** Descripción de la Donación */
  @ApiProperty({
    example: 'Arroz, fideos y enlatados',
    description: 'Detalle o descripción de la donación realizada',
  })
  @IsString()
  detalle: string;

  /** Cantidad de unidades donadas */
  @ApiProperty({
    example: 10,
    description: 'Cantidad de unidades donadas',
  })
  @Type(() => Number)
  @IsInt()
  cantidad: number;

  /** ID del Usuario Asociado*/
  @ApiProperty({
    example: 5,
    description: 'Identificador del usuario asociado a la donación',
  })
  @Type(() => Number)
  @IsInt()
  userId: number;

  /** ID de la Campaña asociada */
  @ApiProperty({
    example: 3,
    description: 'Identificador de la campaña solidaria asociada a la donación',
  })
  @Type(() => Number)
  @IsInt()
  campaignId: number;

  /** Puntos asociados a la campaña */
  @ApiProperty({
    example: 50,
    description: 'Puntos x la cantidad de articulos donados',
  })
  @Type(() => Number)
  @IsInt()
  puntos: number;
}
