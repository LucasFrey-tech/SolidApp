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

export class UpdateCampaignsDto extends PartialType(CreateCampaignsDto) {
  @ApiPropertyOptional({
    example: 'Campaña Solidaria Invierno 2025 (extendida)',
    description: 'Título actualizado de la campaña solidaria',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  titulo?: string;

  @ApiPropertyOptional({
    example: 'FINALIZADA',
    description: 'Nuevo estado de la campaña solidaria',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  estado?: string;

  @ApiPropertyOptional({
    example: 'Campaña extendida hasta fines de agosto',
    description: 'Descripción actualizada de la campaña',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @ApiPropertyOptional({
    example: '2025-09-15',
    description: 'Nueva fecha de Inicio de la campaña',
    type: String,
    format: 'date',
  })
  @IsNotEmpty()
  @IsDateString()
  fecha_Inicio?: Date;

  @ApiPropertyOptional({
    example: '2025-09-15',
    description: 'Nueva fecha de finalización de la campaña',
    type: String,
    format: 'date',
  })
  @IsNotEmpty()
  @IsDateString()
  fecha_Fin?: Date;

  @ApiPropertyOptional({
    example: 750000,
    description: 'Nuevo monto objetivo de la campaña',
  })
  @Min(1)
  @IsNotEmpty()
  @IsNumber()
  objetivo?: number;
}
