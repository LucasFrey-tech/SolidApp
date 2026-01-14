import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

/**
 * Data Transfer Object (DTO) especifico de Create para Beneficios.
 */
export class CreateBeneficiosDTO {
  @ApiProperty({
    example: 'Descuento del 15%',
    description: 'Título del Beneficio',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  @ApiProperty({ example: 'Discount', description: 'Tipo del Beneficio' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tipo: string;

  @ApiProperty({
    example: 'Descuento en artículos de Supermercado',
    description: 'Detalle del beneficio',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  detalle: string;

  @ApiProperty({ example: 50, description: 'Cantidad disponible' })
  @IsNumber()
  @Min(1)
  cantidad: number;

  @ApiProperty({ example: 1, description: 'ID de la empresa' })
  @IsNumber()
  @IsNotEmpty()
  id_empresa: number;
}
