import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContactoOrganizacionDto {
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

export class UpdateDireccionOrganizacionDto {
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

export class UpdateOrganizacionDto {
  @IsOptional()
  @IsString()
  nombre_organizacion?: string;

  @IsOptional()
  @IsString()
  razon_social?: string;

  @IsOptional()
  @IsString()
  cuit?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  web?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateContactoOrganizacionDto)
  contacto?: UpdateContactoOrganizacionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDireccionOrganizacionDto)
  direccion?: UpdateDireccionOrganizacionDto;
}
