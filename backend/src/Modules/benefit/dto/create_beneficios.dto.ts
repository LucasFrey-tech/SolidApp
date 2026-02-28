import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  Min,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BeneficioEstado } from './enum/enum';

/**
 * DTO para la creación de Beneficios.
 * Contiene validaciones para los campos del cuerpo de la petición.
 */
export class CreateBeneficiosDTO {
  /** Título del Beneficio */
  @ApiProperty({ example: 'Descuento del 15%' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  /** Tipo del Beneficio */
  @ApiProperty({ example: 'Discount' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tipo: string;

  /** Descripción del Beneficio */
  @ApiProperty({ example: 'Descuento en supermercado' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  detalle: string;

  /** Cantidad disponible del Beneficio */
  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  cantidad: number;

  /** Valor de canje del Beneficio */
  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valor: number;

  /** ID de la Empresa */
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  id_empresa: number;

  /** Estado del Beneficio */
  @ApiProperty({
    example: BeneficioEstado.APROBADO,
    enum: BeneficioEstado,
    required: false,
  })
  @IsOptional()
  @IsEnum(BeneficioEstado)
  estado?: BeneficioEstado;
}
