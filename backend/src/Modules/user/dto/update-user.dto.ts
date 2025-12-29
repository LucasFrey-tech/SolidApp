import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'nuevo@email.com',
    description: 'Correo electrónico actualizado del usuario',
  })
  correo?: string;

  @ApiPropertyOptional({
    example: 'NuevaPassword123',
    description: 'Nueva clave del usuario',
  })
  clave?: string;

  @ApiPropertyOptional({
    example: 'Juan',
    description: 'Nombre actualizado del usuario',
  })
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Pérez',
    description: 'Apellido actualizado del usuario',
  })
  apellido?: string;

  @ApiPropertyOptional({
    example: 'https://misitio.com/nueva-imagen.png',
    description: 'Nueva imagen de perfil del usuario',
  })
  imagen?: string;

  @ApiPropertyOptional({
    example: 'Calle Falsa 123',
    description: 'Dirección actualizada del usuario',
  })
  direccion?: string;

  @ApiPropertyOptional({
    example: 'ADMIN',
    description: 'Rol del usuario (solo modificable por administradores)',
  })
  rol?: string;
}
