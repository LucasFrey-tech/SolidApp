import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class UpdateContactoDto {
  @ApiPropertyOptional({
    example: '11',
    description: 'Prefijo telefónico (código de área)',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El prefijo no puede estar vacío' })
  @MaxLength(5)
  prefijo?: string;

  @ApiPropertyOptional({
    example: '12345678',
    description: 'Número de teléfono',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El teléfono no puede estar vacío' })
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
  @MinLength(1, { message: 'La calle no puede estar vacía' })
  @MaxLength(80)
  calle?: string;

  @ApiPropertyOptional({
    example: '1234',
    description: 'Número de la calle',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El número no puede estar vacía' })
  @MaxLength(10)
  numero?: string;

  @ApiPropertyOptional({
    example: 'Piso 5, Dpto B',
    description: 'Información adicional (piso, departamento, oficina, etc.)',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'La información adicional no puede estar vacía' })
  @MaxLength(100)
  adicional?: string;

  @ApiPropertyOptional({
    example: 'C1043',
    description: 'Código postal',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El codigo postal no puede estar vacía' })
  @MaxLength(10)
  codigo_postal?: string;

  @ApiPropertyOptional({
    example: 'Buenos Aires',
    description: 'Ciudad',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'La ciudad no puede estar vacía' })
  @MaxLength(50)
  ciudad?: string;

  @ApiPropertyOptional({
    example: 'CABA',
    description: 'Provincia o estado',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'La provincia no puede estar vacía' })
  @MaxLength(50)
  provincia?: string;
}

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @Type(() => String)
  documento?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @Type(() => String)
  nombre?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @Type(() => String)
  apellido?: string;

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
