import { ApiProperty } from '@nestjs/swagger';

export class EmpresaResponseDTO {
  @ApiProperty({ example: 1, description: 'ID único de la Empresa' })
  id: number;

  @ApiProperty({ example: '20-04856975-3', description: 'CUIL de la Empresa' })
  cuit_empresa: string;

  @ApiProperty({
    example: 'empresa@ejemplo.com',
    description: 'Correo electrónico de la empresa',
  })
  correo: string;

  @ApiProperty({
    example: 'Supermercados Unidos S.A.',
    description: 'Razón social',
  })
  razon_social: string;

  @ApiProperty({ example: 'SuperUnidos', description: 'Nombre de fantasía' })
  nombre_empresa: string;

  @ApiProperty({
    example: 'Supermercados Unidos impulsa la solidaridad...',
    description: 'Descripción',
  })
  descripcion: string;

  @ApiProperty({ example: 'Supermercado', description: 'Rubro' })
  rubro: string;

  @ApiProperty({
    description: 'Prefijo telefónico (opcional)',
    example: '+54',
  })
  prefijo: string;

  @ApiProperty({ example: '+54 11 4567-8900', description: 'Teléfono' })
  telefono: string;

  @ApiProperty({
    description: 'Provincia de residencia (opcional)',
    example: 'Buenos Aires',
  })
  provincia: string;

  @ApiProperty({
    description: 'Ciudad de residencia (opcional)',
    example: 'Villa Ballester',
  })
  ciudad: string;

  @ApiProperty({ example: 'Calle falsa', description: 'Calle de la direccion' })
  calle: string;

  @ApiProperty({ example: '123', description: 'Numero de la direccion' })
  numero: string;

  @ApiProperty({
    description: 'Código postal (opcional)',
    example: 'B1638',
  })
  codigo_postal: string;

  @ApiProperty({
    example: 'www.supermercadosunidos.com.ar',
    description: 'Sitio web',
  })
  web: string;

  @ApiProperty({ example: true, description: 'Empresa verificada' })
  verificada: boolean;

  @ApiProperty({ example: false, description: 'Empresa deshabilitada' })
  deshabilitado: boolean;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de registro',
  })
  fecha_registro: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última conexión del usuario',
    example: '2026-02-22T11:55:00.000Z',
  })
  ultima_conexion: Date;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de última modificación',
  })
  ultimo_cambio: Date;

  @ApiProperty({
    example: '/Logo.png',
    description: 'Logo de la empresa',
  })
  logo: string;
}
