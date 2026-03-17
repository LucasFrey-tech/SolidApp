import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Rol } from '../../../Entities/usuario.entity';
import { Expose, Type } from 'class-transformer';
import { ContactoDto, DireccionDto } from '../../contacto_direccion/dto';
import { EmpresaUsuario } from '../../../Entities/empresa_usuario.entity';
import { OrganizacionUsuario } from '../../../Entities/organizacion_usuario.entity';

export class UsuarioResumenDto {
  @ApiProperty({ example: 5, description: 'ID del usuario' })
  id: number;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  nombre: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del usuario' })
  apellido: string;

  @ApiProperty({ example: 'juan@email.com', description: 'Email del usuario' })
  email?: string;
}

export class ResponseUsuarioDto {
  @ApiProperty({ example: 12, description: 'Identificador único del usuario' })
  id: number;

  @ApiProperty({ example: '12345678', description: 'Documento del Usuario' })
  documento: string;

  @ApiProperty({
    example: '$2b$10$N9qo8uLOickgx2ZMRZo5i.U5lH0Q5sFvJ8zFh7pZzQmZzYyQ5Qf6e',
    description: 'HASH',
  })
  clave: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  nombre: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del usuario' })
  apellido: string;

  @ApiProperty({
    example: Rol.USUARIO,
    description: 'Rol del usuario',
  })
  rol: Rol;

  @ApiProperty({ example: 150, description: 'Puntos del usuario' })
  puntos: number;

  @ApiProperty({
    description: 'Información de contacto del usuario',
    type: ContactoDto,
  })
  @Expose()
  @Type(() => ContactoDto)
  contacto: ContactoDto;

  @ApiPropertyOptional({
    description: 'Dirección del usuario',
    type: DireccionDto,
  })
  @Expose()
  @Type(() => DireccionDto)
  direccion?: DireccionDto;

  @ApiProperty({ example: false, description: 'Indica si está deshabilitado' })
  habilitado: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario esta verificado',
  })
  verificado: boolean;

  @ApiProperty({
    example: '2025-05-15T10:30:00.000Z',
    description: 'Fecha de registro',
  })
  fecha_registro: Date;

  @ApiProperty({
    example: '2025-05-15T10:30:00.000Z',
    description: 'Fecha de ultimo cambio',
  })
  ultimo_cambio: Date;

  @ApiProperty({
    example: '2025-05-15T10:30:00.000Z',
    description: 'Fecha de ultimo cambio',
  })
  ultima_conexion: Date;

  @ApiPropertyOptional({
    description: 'ID de la empresa a la que pertenece el usuario (si aplica)',
    example: 5,
  })
  empresa_usuario?: EmpresaUsuario;

  @ApiPropertyOptional({
    description:
      'ID de la organización a la que pertenece el usuario (si aplica)',
    example: 3,
  })
  organizacion_usuario?: OrganizacionUsuario;
}
