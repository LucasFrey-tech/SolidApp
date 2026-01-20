import { ApiProperty } from '@nestjs/swagger';

export class ResponseUsuarioDto {
  @ApiProperty({
    example: 12,
    description: 'Identificador único del usuario',
  })
  id: number;

  @ApiProperty({
    example: '12345678',
    description: 'Documento del Usuario',
  })
  documento: string;

  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Correo electrónico del usuario',
  })
  correo: string;

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
    example: 'https://misitio.com/avatar.png',
    description: 'Imagen de perfil del usuario',
  })
  imagen: string;

  @ApiProperty({
    description: 'Nombre de la calle del domicilio del usuario',
    example: 'Av. Siempre Viva',
  })
  calle?: string;

  @ApiProperty({
    description: 'Número de la dirección del usuario',
    example: '742',
  })
  numero?: string;

  @ApiProperty({
    example: 'USER',
    description: 'Rol del usuario dentro del sistema',
  })
  rol: string;

  @ApiProperty({
    example: false,
    description: 'Indica si el usuario está deshabilitado',
  })
  deshabilitado: boolean;

  @ApiProperty({
    example: '2025-05-15T10:30:00.000Z',
    description: 'Fecha en la que el usuario fue registrado en el sistema',
    type: String,
    format: 'date-time',
  })
  fechaRegistro: Date;
}
