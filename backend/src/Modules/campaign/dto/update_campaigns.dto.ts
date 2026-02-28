import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCampaignsDto } from './create_campaigns.dto';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO para la actualización de datos de las Campañas.
 */
export class UpdateCampaignsDto extends PartialType(CreateCampaignsDto) {
  /** Título de la Campaña */
  @ApiPropertyOptional({
    example: 'Campaña Solidaria Invierno 2025 (extendida)',
    description: 'Título actualizado de la campaña solidaria',
  })
  @IsString()
  @MaxLength(255)
  titulo?: string;

  /** Estado de la Campaña */
  @ApiPropertyOptional({
    example: 'FINALIZADA',
    description: 'Nuevo estado de la campaña solidaria',
  })
  @IsString()
  @MaxLength(20)
  estado?: string;

  /** Descripción de la Campaña */
  @ApiPropertyOptional({
    example: 'Campaña extendida hasta fines de agosto',
    description: 'Descripción actualizada de la campaña',
  })
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  /** Fecha de Inicio de la Campaña */
  @ApiPropertyOptional({
    example: '2025-09-15',
    description: 'Nueva fecha de Inicio de la campaña',
    type: String,
    format: 'date',
  })
  @IsDateString()
  fecha_Inicio?: Date;

  /** Fecha de Finalización de la Campaña */
  @ApiPropertyOptional({
    example: '2025-09-15',
    description: 'Nueva fecha de finalización de la campaña',
    type: String,
    format: 'date',
  })
  @IsDateString()
  fecha_Fin?: Date;

  /** Objetivo de la Campaña */
  @ApiPropertyOptional({
    example: 750000,
    description: 'Nuevo monto objetivo de la campaña',
  })
  @Type(() => Number)
  @Min(1)
  @IsNumber()
  objetivo?: number;

  /** Puntos que se otorgan por donacion */
  @ApiPropertyOptional({
    example: 75,
    description: 'Puntos por donación a la campaña, por cantidad de articulos',
  })
  @Type(() => Number)
  @Min(1)
  @IsNumber()
  puntos?: number;

  @IsOptional()
  @Transform(
    ({ value }) =>
      (Array.isArray(value) ? value : value ? [value] : []) as string[],
  )
  @IsArray()
  @IsString({ each: true })
  imagenesExistentes?: string[];
}
