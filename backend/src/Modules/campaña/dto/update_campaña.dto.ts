import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCampañaDto } from './create_campaña.dto';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateCampañaDto extends PartialType(CreateCampañaDto) {
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
  description?: string;

  @ApiPropertyOptional({
    example: '2025-09-15',
    description: 'Nueva fecha de finalización de la campaña',
    type: String,
    format: 'date',
  })
  @IsNotEmpty()
  @IsDate()
  fechaFin?: Date;

  @ApiPropertyOptional({
    example: 750000,
    description: 'Nuevo monto objetivo de la campaña',
  })
  @Min(1)
  @IsNotEmpty()
  @IsNumber()
  objetivo?: number;
}
