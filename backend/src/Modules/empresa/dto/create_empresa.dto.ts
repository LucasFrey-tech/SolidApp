import { IsOptional, IsString, IsEmail, MinLength, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmpresaDTO {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  documento: string;

  @ApiProperty({ example: 'gestor@empresa.com' })
  @IsEmail()
  correo: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(6)
  clave: string;

  @ApiProperty({ example: '11' })
  @IsString()
  @IsNotEmpty()
  prefijo: string;

  @ApiProperty({ example: '1123456789' })
  @IsString()
  @IsNotEmpty()
  telefono: string;

  // ===== Datos de la Empresa =====

  @ApiProperty({ example: 'contacto@empresa.com' })
  @IsEmail()
  correo_empresa: string;

  @ApiProperty({ example: '30123456789' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'El CUIT debe tener exactamente 11 dígitos numéricos' })
  cuit_empresa: string;

  @ApiProperty({ example: 'Empresa S.A.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  razon_social: string;

  @ApiProperty({ example: 'Mi Empresa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre_empresa: string;

  @ApiProperty({ example: 'Av. Siempre Viva' })
  @IsString()
  @IsNotEmpty()
  calle: string;

  @ApiProperty({ example: '742' })
  @IsString()
  @IsNotEmpty()
  numero: string;

  @ApiProperty({ example: 'https://miempresa.com', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  web?: string;
}