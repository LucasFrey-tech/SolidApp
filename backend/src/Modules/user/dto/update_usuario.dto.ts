// update_usuario.dto.ts - VERSIÓN CORREGIDA
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsInt, Min, Length } from 'class-validator';

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'nuevo@email.com' })
  @IsOptional()
  @IsEmail()
  correo?: string;

  @ApiPropertyOptional({ example: 'NuevaPassword123' })
  @IsOptional()
  @IsString()
  clave?: string;

  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional()
  @IsString()
  apellido?: string;

  @ApiPropertyOptional({ example: 'https://misitio.com/nueva-imagen.png' })
  @IsOptional()
  @IsString()
  imagen?: string;

  @ApiPropertyOptional({ example: 'Av. Siempre Viva' })
  @IsOptional()
  @IsString()
  calle?: string;

  @ApiPropertyOptional({ example: '123' })
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  departamento?: string;

  @ApiPropertyOptional({ example: '1425' })
  @IsOptional()
  @IsString()
  codigoPostal?: string;

  @ApiPropertyOptional({ example: 'Buenos Aires' })
  @IsOptional()
  @IsString()
  provincia?: string;

  @ApiPropertyOptional({ example: 'CABA' })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiPropertyOptional({ example: '11' })
  @IsOptional()
  @IsString()
  @Length(1, 5)
  prefijo?: string;

  @ApiPropertyOptional({ example: '12345678' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ example: 'ADMIN' })
  @IsOptional()
  @IsString()
  rol?: string;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsInt()
  @Min(0)
  puntos?: number;
}
