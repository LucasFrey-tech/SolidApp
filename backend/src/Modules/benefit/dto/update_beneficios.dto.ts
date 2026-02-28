import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBeneficiosDTO } from './create_beneficios.dto';
import { IsEnum, IsOptional, Min } from 'class-validator';
import { BeneficioEstado } from './enum/enum';

/**
 * DTO para la actualizacion de datos de los Beneficios.
 */
export class UpdateBeneficiosDTO extends PartialType(CreateBeneficiosDTO) {
  /** Cantidad Disponible */
  @ApiProperty({
    example: 10,
    description: 'Cantidad disponible',
    required: false,
  })
  @IsOptional()
  @Min(0)
  cantidad?: number;

  /** Valor del Benficio */
  @ApiProperty({
    example: 200,
    description: 'Valor del beneficio',
    required: false,
  })
  @IsOptional()
  @Min(0)
  valor?: number;

  /** Estado del Beneficio */
  @ApiProperty({
    example: 'pendiente',
    description: 'Estado del beneficio',
    enum: ['pendiente', 'aprobado', 'rechazado'],
    required: false,
  })
  @IsOptional()
  @IsEnum(BeneficioEstado)
  estado?: BeneficioEstado;
}
