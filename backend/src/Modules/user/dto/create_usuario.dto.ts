import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Rol } from '../enums/enums';

export class CreateUsuarioDto {
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
    example: '12345678',
    description: 'Documento del Usuario',
  })
  documento: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  nombre: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  apellido: string;

  @ApiProperty({
    example: 0,
    description: 'Puntos iniciales del usuario',
    default: 0,
  })
  puntos?: number;

  @ApiProperty({
    example: Rol.USUARIO,
    description: 'Rol del usuario',
  })
  rol: Rol;
}
