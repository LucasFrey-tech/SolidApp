import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  MaxLength,
  IsNotEmpty,
  IsDate,
  Min,
} from 'class-validator';

export class CreateCampaignsDto {
  @ApiProperty({
    example: 1,
    description: 'ID Foranea de la Organización',
  })
  @IsNotEmpty()
  @IsNumber()
  id_organizacion: number;

  @ApiProperty({
    example: 'Campaña Solidaria Invierno 2025',
    description: 'Título de la campaña solidaria',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  @ApiProperty({
    example: 'ACTIVA',
    description: 'Estado actual de la campaña (ACTIVA, FINALIZADA, CANCELADA)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  estado: string;

  @ApiProperty({
    example: 'Campaña destinada a la recolección de ropa de abrigo',
    description: 'Descripción detallada de la campaña solidaria',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @ApiProperty({
    example: '2025-06-01',
    description: 'Fecha de inicio de la campaña',
    type: String,
    format: 'date',
  })
  @IsDate()
  @IsNotEmpty()
  fechaInicio: Date;

  @ApiProperty({
    example: '2025-08-31',
    description: 'Fecha de finalización de la campaña',
    type: String,
    format: 'date',
  })
  @IsDate()
  @IsNotEmpty()
  fechaFin: Date;

  @ApiProperty({
    example: '2025-05-15',
    description: 'Fecha de registro de la campaña en el sistema',
    type: String,
    format: 'date',
  })
  @IsDate()
  @IsNotEmpty()
  fechaRegistro: Date;

  @ApiProperty({
    example: 500000,
    description: 'Monto objetivo a recaudar para la campaña solidaria',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  objetivo: number;
}
