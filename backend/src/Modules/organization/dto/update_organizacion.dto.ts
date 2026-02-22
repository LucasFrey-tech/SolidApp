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
}
