import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

/**
 * Data Tansfer Object (DTO) para el canje de Beneficios por parte de los Usuarios.
 */
export class CanjearBeneficioDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  userId: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  cantidad: number;
}
