import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateEstadoBeneficioDTO {
  @ApiProperty({
    example: 'aprobado',
    enum: ['pendiente', 'aprobado', 'rechazado'],
  })
  @IsIn(['pendiente', 'aprobado', 'rechazado'])
  estado: 'pendiente' | 'aprobado' | 'rechazado';
}
