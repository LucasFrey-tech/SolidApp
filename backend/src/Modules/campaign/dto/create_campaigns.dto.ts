import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  MaxLength,
  IsNotEmpty,
  Min,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object (DTO) para la creacion de Campañas.
 * Contiene validaciones para los campos del cuerpo de la petición.
 */
export class CreateCampaignsDto {
  /** ID de la Organización asociada */
  @ApiProperty({
    example: 1,
    description: 'ID Foranea de la Organización',
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  id_organizacion: number;

  /** Título de la Campaña */
  @ApiProperty({
    example: 'Campaña Solidaria Invierno 2025',
    description: 'Título de la campaña solidaria',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  /** Estado de la Campaña */
  @ApiProperty({
    example: 'ACTIVA',
    description: 'Estado actual de la campaña (ACTIVA, FINALIZADA, CANCELADA)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  estado?: string;

  /** Descripción de la Campaña */
  @ApiProperty({
    example: 'Campaña destinada a la recolección de ropa de abrigo',
    description: 'Descripción detallada de la campaña solidaria',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion: string;

  /** Fecha de Inicio de la Campaña */
  @ApiProperty({
    example: '2025-06-01',
    description: 'Fecha de inicio de la campaña',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha_Inicio: Date;

  /** Fecha de Finalización de la Campaña */
  @ApiProperty({
    example: '2025-08-31',
    description: 'Fecha de finalización de la campaña',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha_Fin: Date;

  /** Cantidad a recaudar */
  @ApiProperty({
    example: 500000,
    description: 'Monto objetivo a recaudar para la campaña solidaria',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  objetivo: number;

  @ApiProperty({
    example: 75,
    description: 'Puntos por donación a la campaña, por cantidad de articulos',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  puntos: number;
}
