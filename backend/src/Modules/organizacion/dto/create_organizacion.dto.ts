import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizacionDto {
  // ===== Datos del COLABORADOR =====

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

  @ApiProperty({ example: 'colaborador@organizacion.com' })
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

  // ===== Datos de la Organización =====

  @ApiProperty({ example: 'contacto@organizacion.com' })
  @IsEmail()
  correo_organizacion: string;

  @ApiProperty({ example: '30123456789' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, {
    message: 'El CUIT debe tener exactamente 11 dígitos numéricos',
  })
  cuit_organizacion: string;

  @ApiProperty({ example: 'Fundación Ayudar' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  razon_social: string;

  @ApiProperty({ example: 'Ayudar' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre_organizacion: string;

  @ApiProperty({ example: 'Av. Siempre Viva' })
  @IsString()
  @IsNotEmpty()
  calle: string;

  @ApiProperty({ example: '742' })
  @IsString()
  @IsNotEmpty()
  numero: string;

  @ApiProperty({ example: 'https://fundacion.org', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  web?: string;
}
