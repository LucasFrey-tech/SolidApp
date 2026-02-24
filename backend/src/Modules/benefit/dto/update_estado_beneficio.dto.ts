import { ApiProperty } from '@nestjs/swagger';
import { BeneficioEstado } from './enum/enum';

/**
 * DTO para la actualizacion del estado de los Beneficios
 */
export class UpdateEstadoBeneficioDTO {
  /** Estados del Beneficio */
  @ApiProperty({
    example: BeneficioEstado.APROBADO,
    enum: BeneficioEstado,
  })
  estado: BeneficioEstado;
}
