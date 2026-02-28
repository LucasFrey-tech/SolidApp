import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

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

  @ApiPropertyOptional({ example: '+54' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  prefijo?: string;

  @ApiPropertyOptional({ example: '1123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

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
  @MaxLength(50)
  provincia?: string;

  @ApiPropertyOptional({ example: 'Vicente López' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ciudad?: string;

  @ApiPropertyOptional({ example: 'B1638' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigo_postal?: string;

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
}
