import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Rol } from '../../../Entities/usuario.entity';

/**
 * Data Transfer Object (DTO) para Register y Login.
 * Se usa para validar y transformar datos entre el cliente y el servidor.
 */

export class LoginDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Correo electrónico de la cuenta',
  })
  @IsEmail()
  correo: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Contraseña de la cuenta',
  })
  @IsString()
  @MinLength(6)
  clave: string;

}

export class RegisterDto {
  @ApiProperty({
    example: 'correo@email.com',
  })
  @IsEmail()
  correo: string;

  @ApiProperty({
    example: 'Password123',
  })
  @IsString()
  @MinLength(6)
  clave: string;

  @ApiProperty({
    example: 'Lucas',
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 'Frey',
  })
  @IsString()
  apellido: string;

  @ApiProperty({
    example: '11888858',
  })
  @IsString()
  documento: string;
}

export class AuthResponse {
  /**
   * Token
   * @type {string}
   */
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...' })
  token: string;
}
