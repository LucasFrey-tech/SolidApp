import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

/**
 * DTO para la actualizacion del estado de los Beneficios
 */
export class UpdateEstadoBeneficioDTO {
  /** Estados del Beneficio */
  @ApiProperty({
    example: 'aprobado',
    enum: ['pendiente', 'aprobado', 'rechazado'],
  })
  @IsIn(['pendiente', 'aprobado', 'rechazado'])
  estado: 'pendiente' | 'aprobado' | 'rechazado';
}
