import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrganizacionDto {
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

  @ApiPropertyOptional({ example: '+54' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  prefijo?: string;

  @ApiPropertyOptional({ example: '1122334455' })
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

  @ApiPropertyOptional({ example: '1638' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigo_postal?: string;
}
