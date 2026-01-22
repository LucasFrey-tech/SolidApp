import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginRequestBody {
  /**
   * Email del usuario
   * @type {string}
   */
  @ApiProperty({ example: 'sarasa@gmail.com' })
  @IsEmail()
  correo: string;

  /**
   * Contraseña del usuario
   * @type {string}
   */
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  clave: string;

  /**
   * Constructor del DTO.
   */
  constructor(email: string, password: string) {
    this.correo = email;
    this.clave = password;
  }
}

export class RegisterUsuarioDto {
  @ApiProperty({
    example: '12345678',
    description: 'Documento del Usuario',
  })
  @IsString()
  @MinLength(8)
  documento: string;

  @ApiProperty({ description: 'Email del usuario' })
  @IsEmail()
  correo: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(6)
  clave: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  @IsString()
  @MinLength(2)
  nombre: string;

  @ApiProperty({ description: 'Apellido del usuario' })
  @IsString()
  @MinLength(2)
  apellido: string;

  @ApiProperty({ description: 'Imagen de perfil', required: false })
  @IsString()
  @IsOptional()
  imagen?: string;

  @ApiProperty({ description: 'Nombre de la Calle', required: false })
  @IsString()
  @IsOptional()
  calle?: string;

  @ApiProperty({ description: 'Número de la calle', required: false })
  @IsString()
  @IsOptional()
  numero?: string;
}

export class RegisterEmpresaDto {
  @ApiProperty({ description: 'Número de documento' })
  @IsString()
  @MinLength(3)
  documento: string;

  @ApiProperty({ description: 'Razón social' })
  @IsString()
  @MinLength(3)
  razonSocial: string;

  @ApiProperty({ description: 'Nombre de fantasía' })
  @IsString()
  @MinLength(3)
  nombreFantasia: string;

  @ApiProperty({ description: 'Contraseña' })
  @IsString()
  @MinLength(6)
  clave: string;

  @ApiProperty({
    description: 'Rubro o sector de la empresa',
    example: 'Tecnología',
  })
  @IsString()
  rubro: string;

  @ApiProperty({ description: 'Teléfono' })
  @IsString()
  @MinLength(8)
  telefono: string;

  @ApiProperty({ description: 'Dirección' })
  @IsString()
  @MinLength(5)
  direccion: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail()
  correo: string;

  @ApiProperty({ description: 'Sitio web', required: false })
  @IsString()
  @IsOptional()
  web?: string;
}

export class RegisterOrganizacionDto {
  @ApiProperty({ description: 'Número de documento' })
  @IsString()
  @MinLength(3)
  documento: string;

  @ApiProperty({ description: 'Razón social' })
  @IsString()
  @MinLength(3)
  razonSocial: string;

  @ApiProperty({ description: 'Nombre' })
  @IsString()
  @MinLength(3)
  nombreFantasia: string;

  @ApiProperty({ description: 'Contraseña' })
  @IsString()
  @MinLength(6)
  clave: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail()
  correo: string;
}

export class AuthResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...' })
  access_token: string;
}
