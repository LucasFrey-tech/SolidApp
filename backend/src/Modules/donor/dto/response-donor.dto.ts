import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseDonorDto {
  @ApiProperty({
    example: 5,
    description: 'Identificador único del donador',
  })
  id: number;

  @ApiProperty({
    example: 12,
    description: 'Identificador del usuario asociado al donador',
  })
  userId: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Cantidad total de donaciones realizadas por el donador',
  })
  totalDonaciones?: number;

  @ApiPropertyOptional({
    example: 125000,
    description: 'Monto total donado por el donador',
  })
  totalDonado?: number;
}
