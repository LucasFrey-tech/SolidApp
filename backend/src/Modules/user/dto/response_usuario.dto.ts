import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseUsuarioDto {
  @ApiProperty({ example: 12, description: 'Identificador único del usuario' })
  id: number;

  @ApiProperty({ example: '12345678', description: 'Documento del Usuario' })
  documento: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  nombre: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del usuario' })
  apellido: string;

  @ApiProperty({ example: 150, description: 'Puntos del usuario' })
  puntos: number;

  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Correo electrónico',
  })
  correo: string;

  @ApiPropertyOptional({ example: '+54', description: 'Prefijo telefónico' })
  prefijo?: string;

  @ApiPropertyOptional({ example: '11-1234-5678', description: 'Teléfono' })
  telefono?: string;

  @ApiPropertyOptional({ example: 'Av. Siempre Viva', description: 'Calle' })
  calle?: string;

  @ApiPropertyOptional({ example: '742', description: 'Número' })
  numero?: string;

  @ApiPropertyOptional({ example: '1638', description: 'Código Postal' })
  codigoPostal?: string;

  @ApiPropertyOptional({ example: 'Buenos Aires', description: 'Provincia' })
  provincia?: string;

  @ApiPropertyOptional({ example: 'Vicente López', description: 'Ciudad' })
  ciudad?: string;

  @ApiProperty({ example: false, description: 'Indica si está deshabilitado' })
  deshabilitado: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario esta verificado',
  })
  verificada: boolean;

  @ApiProperty({
    example: '2025-05-15T10:30:00.000Z',
    description: 'Fecha de registro',
  })
  fechaRegistro: Date;

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
}
