import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class UpdateContactoDto {
  @ApiPropertyOptional({
    example: '11',
    description: 'Prefijo telefónico (código de área)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  prefijo?: string;

  @ApiPropertyOptional({
    example: '12345678',
    description: 'Número de teléfono',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}

export class UpdateDireccionDto {
  @ApiPropertyOptional({
    example: 'Av. Corrientes',
    description: 'Nombre de la calle',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  calle?: string;

  @ApiPropertyOptional({
    example: '1234',
    description: 'Número de la calle',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  numero?: string;

  @ApiPropertyOptional({
    example: 'Piso 5, Dpto B',
    description: 'Información adicional (piso, departamento, oficina, etc.)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  adicional?: string;

  @ApiPropertyOptional({
    example: 'C1043',
    description: 'Código postal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigo_postal?: string;

  @ApiPropertyOptional({
    example: 'Buenos Aires',
    description: 'Ciudad',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ciudad?: string;

  @ApiPropertyOptional({
    example: 'CABA',
    description: 'Provincia o estado',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  provincia?: string;
}

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ type: UpdateContactoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateContactoDto)
  contacto?: UpdateContactoDto;

  @ApiPropertyOptional({ type: UpdateDireccionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDireccionDto)
  direccion?: UpdateDireccionDto;
}
