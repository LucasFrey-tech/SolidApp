import { ApiProperty } from '@nestjs/swagger';

export class CanjearResponseDto {
  @ApiProperty({ example: true, description: 'Indica si el canje fue exitoso' })
  success: boolean;

  @ApiProperty({ example: 2, description: 'Cantidad de unidades canjeadas' })
  cantidadCanjeada: number;

  @ApiProperty({ example: 100, description: 'Puntos gastados en el canje' })
  puntosGastados: number;

  @ApiProperty({
    example: 50,
    description: 'Puntos restantes del usuario después del canje',
  })
  puntosRestantes: number;

  @ApiProperty({ example: 98, description: 'Stock restante del beneficio' })
  stockRestante: number;
}
