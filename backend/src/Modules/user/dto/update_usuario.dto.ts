import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUsuarioDto {
  @ApiPropertyOptional({
    description: 'Nombre de la calle del domicilio (opcional)',
    example: 'Av. Libertador',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  calle?: string;

  @ApiPropertyOptional({
    description: 'Número de la dirección (opcional)',
    example: '742',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  numero?: string;

  @ApiPropertyOptional({
    description: 'Código postal (opcional)',
    example: 'B1638',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigo_postal?: string;

  @ApiPropertyOptional({
    description: 'Ciudad de residencia (opcional)',
    example: 'Villa Ballester',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ciudad?: string;

  @ApiPropertyOptional({
    description: 'Provincia de residencia (opcional)',
    example: 'Buenos Aires',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  provincia?: string;

  @ApiPropertyOptional({
    description: 'Prefijo telefónico (opcional)',
    example: '+54',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  prefijo?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono (opcional)',
    example: '11-4444-5555',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ example: '2B' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  departamento?: string;
}
