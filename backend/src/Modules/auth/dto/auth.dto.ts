import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

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

export class RegisterRequestBody {
  /**
   * Nombre del usuario
   * @type {string}
   */
  @ApiProperty({ example: 'Lucas' })
  @IsString()
  nombre: string;

  /**
   * Apellido del usuario
   * @type {string}
   */
  @ApiProperty({ example: 'Frey' })
  @IsString()
  apellido: string;

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

  /** * Imagen de perfil del usuario * @type {string} */ @ApiProperty({
    example: 'https://miapp.com/imagenes/avatar.png',
  })
  @IsString()
  imagen: string;
  /** * Dirección del usuario * @type {string} */ @ApiProperty({
    example: 'Av. Siempre Viva 742',
  })
  @IsString()
  direccion: string;
  /** * Rol del usuario * @type {string} */ @ApiProperty({ example: 'admin' })
  @IsString()
  rol: string;
  /** * Constructor del DTO. */ constructor(
    nombre: string,
    apellido: string,
    correo: string,
    clave: string,
    imagen: string,
    direccion: string,
    rol: string,
  ) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.correo = correo;
    this.clave = clave;
    this.imagen = imagen;
    this.direccion = direccion;
    this.rol = rol;
  }
}

// En auth.dto.ts, actualiza los DTOs:

export class RegisterUsuarioDto {
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

  @ApiProperty({ description: 'Dirección', required: false })
  @IsString()
  @IsOptional()
  direccion?: string;
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
