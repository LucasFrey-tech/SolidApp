import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CanjearBeneficioDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  cantidad: number;
}
