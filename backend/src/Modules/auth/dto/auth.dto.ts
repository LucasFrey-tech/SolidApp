import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object (DTO) para Register y Login.
 * Se usa para validar y transformar datos entre el cliente y el servidor.
 */

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
