import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
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
}
export class ContactoOrganizacionDto {
  
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

export class UpdateOrganizacionDto {

  @ApiPropertyOptional({ example: 'Mi Organización' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre_organizacion?: string;

  @ApiPropertyOptional({ example: 'Empresa SRL' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  razon_social?: string;

  @ApiPropertyOptional({ example: '20301234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cuit?: string;

  @ApiPropertyOptional({ example: 'Nueva descripción de la organización' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({ example: 'https://nuevo-sitio.org' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  web?: string;



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

  @ApiPropertyOptional({ example: '1638' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigo_postal?: string;

  @ApiPropertyOptional({ type: ContactoOrganizacionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactoOrganizacionDto)
  contacto?: ContactoOrganizacionDto;

  @ApiPropertyOptional({ type: UpdateDireccionOrganizacionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDireccionOrganizacionDto)
  direccion?: UpdateDireccionOrganizacionDto;
}


