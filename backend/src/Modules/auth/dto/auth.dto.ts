import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { RolCuenta } from '../../../Entities/cuenta.entity';
import { Type } from 'class-transformer';
import { RegistroOrganizacionDto } from '../../organization/dto/registro_organizacion.dto';
import { RegistroUsuarioDto } from '../../user/dto/registro_usuario.dto';
import { RegistroEmpresaDto } from '../../empresa/dto/registro_empresa.dto';

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

  @ApiProperty({ example: 'Password123' })
  @IsString()
  confirmar_clave: string;

  @ApiProperty({
    enum: RolCuenta,
    example: RolCuenta.USUARIO,
  })
  @IsEnum(RolCuenta)
  role: RolCuenta;

  @ApiProperty({
    description: 'Datos del perfil según el rol',
  })
  @ValidateNested()
  @Type(() => Object)
  perfil: RegistroUsuarioDto | RegistroEmpresaDto | RegistroOrganizacionDto;
}

export class AuthResponse {
  /**
   * Token
   * @type {string}
   */
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...' })
  token: string;
}
