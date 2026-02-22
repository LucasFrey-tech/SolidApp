import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistroEmpresaDto {
  @ApiProperty({ example: '30-12345678-9' })
  @IsString()
  cuit_empresa: string;

  @ApiProperty({ example: 'empresa@email.com' })
  @IsEmail()
  correo: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(6)
  clave: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  confirmarClave: string;

  @ApiProperty({ example: 'Empresa S.A.' })
  @IsString()
  razon_social: string;

  @ApiProperty({ example: 'Mi Empresa' })
  @IsString()
  nombre_empresa: string;

  @ApiProperty({ example: '1123456789' })
  @IsString()
  telefono: string;

  @ApiProperty({ example: 'Av. Siempre Viva' })
  @IsString()
  direccion: string;

  @ApiProperty({ example: '742' })
  @IsString()
  numero: string;

  @ApiProperty({ example: 'https://miempresa.com', required: false })
  @IsOptional()
  @IsString()
  web?: string;
}
