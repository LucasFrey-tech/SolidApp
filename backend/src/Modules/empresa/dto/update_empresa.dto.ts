import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEmpresaDTO {
  @ApiPropertyOptional({ example: 'Nueva descripción de la empresa' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

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
