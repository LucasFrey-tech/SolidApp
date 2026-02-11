import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCampaignsDto } from './create_campaigns.dto';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO para la actualización de datos de las Campañas.
 */
export class UpdateCampaignsDto extends PartialType(CreateCampaignsDto) {
  /** Título de la Campaña */
  @ApiPropertyOptional({
    example: 'Campaña Solidaria Invierno 2025 (extendida)',
    description: 'Título actualizado de la campaña solidaria',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  titulo?: string;

  /** Estado de la Campaña */
  @ApiPropertyOptional({
    example: 'FINALIZADA',
    description: 'Nuevo estado de la campaña solidaria',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  estado?: string;

  /** Descripción de la Campaña */
  @ApiPropertyOptional({
    example: 'Campaña extendida hasta fines de agosto',
    description: 'Descripción actualizada de la campaña',
  })
  @IsNotEmpty()
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
  @IsNotEmpty()
  @IsDateString()
  fecha_Inicio?: Date;

  /** Fecha de Finalización de la Campaña */
  @ApiPropertyOptional({
    example: '2025-09-15',
    description: 'Nueva fecha de finalización de la campaña',
    type: String,
    format: 'date',
  })
  @IsNotEmpty()
  @IsDateString()
  fecha_Fin?: Date;

  /** Objetivo de la Campaña */
  @ApiPropertyOptional({
    example: 750000,
    description: 'Nuevo monto objetivo de la campaña',
  })
  @Min(1)
  @IsNotEmpty()
  @IsNumber()
  objetivo?: number;
}
