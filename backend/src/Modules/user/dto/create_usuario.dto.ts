import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
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
}
