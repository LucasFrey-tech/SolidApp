import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class UpdateContactoEmpresaDto {
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

export class UpdateDireccionEmpresaDto {
  @ApiPropertyOptional({ example: 'Av. Siempre Viva' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  calle?: string;

  @ApiPropertyOptional({ example: '742' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  numero?: string;

  @ApiPropertyOptional({ example: 'Buenos Aires' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  provincia?: string;

  @ApiPropertyOptional({ example: 'San Isidro' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional({ example: '1638' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigo_postal?: string;
}

export class UpdateEmpresaDTO {
  @ApiPropertyOptional({ example: 'Nueva descripción de la empresa' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({ example: 'Supermercado' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rubro?: string;

  @ApiPropertyOptional({ example: 'https://nueva-web.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  web?: string;

  @ApiPropertyOptional({ example: 'nuevo-logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  logo?: string;

  @ApiPropertyOptional({ type: UpdateContactoEmpresaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateContactoEmpresaDto)
  contacto?: UpdateContactoEmpresaDto;

  @ApiPropertyOptional({ type: UpdateDireccionEmpresaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDireccionEmpresaDto)
  direccion?: UpdateDireccionEmpresaDto;
}
