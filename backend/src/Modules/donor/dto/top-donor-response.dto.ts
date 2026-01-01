import { ApiProperty } from '@nestjs/swagger';

export class TopDonorResponseDto {
  @ApiProperty({ example: 1, description: 'ID del donador' })
  id: number;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del donador' })
  nombre: string;

  @ApiProperty({
    example: 12500,
    description: 'Monto total donado por el donador',
  })
  totalDonado: number;
}
