import { ApiProperty } from '@nestjs/swagger';

export class ResponseOrganizacionDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la organización',
  })
  id: number;

  @ApiProperty({
    example: '30-71234567-8',
    description: 'Número de documento o CUIT de la organización',
  })
  cuit_organizacion: string;

  @ApiProperty({
    example: 'organizacion@ejemplo.com',
    description: 'Correo electrónico de la organización',
  })
  correo: string;

  @ApiProperty({
    example: 'Fundación Ayudar',
    description: 'Razón social de la organización',
  })
  razon_social: string;

  @ApiProperty({
    example: 'Ayudar',
    description: 'Nombre de fantasía de la organización',
  })
  nombre_organizacion: string;

  @ApiProperty({
    example: true,
    description: 'Indica si la organización fue verificada por el sistema',
  })
  verificada: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si la organización se encuentra deshabilitada',
  })
  deshabilitado: boolean;

  @ApiProperty({
    example: 'Organización dedicada a campañas solidarias y ayuda comunitaria',
    description: 'Descripción general de la organización',
  })
  descripcion: string;

  @ApiProperty({
    description: 'Prefijo telefónico (opcional)',
    example: '+54',
  })
  prefijo: string;

  @ApiProperty({
    example: '+54 11 4567-8900',
    description: 'Número de teléfono de contacto de la organización',
  })
  telefono: string;

  @ApiProperty({
    example: 'Av. Siempre Viva',
    description: 'Calle de la direccion de la organizacion',
  })
  calle: string;

  @ApiProperty({
    example: '+54 11 4567-8900',
    description: 'numero de direcion de la organizacion',
  })
  numero: string;

  @ApiProperty({
    example: 'Villa Adelina',
    description: 'Ciudad de residencia de la organizacion',
  })
  ciudad: string;

  @ApiProperty({
    example: 'Buenos Aires',
    description: 'Provincia donde reside la organizacion',
  })
  provincia: string;

  @ApiProperty({
    example: 'C1420ABC',
    description: 'Código postal de la organizacion',
  })
  codigo_postal: string;

  @ApiProperty({
    example: 'https://www.fundacionayudar.org',
    description: 'Sitio web oficial de la organización',
  })
  web: string;

  @ApiProperty({
    example: '2025-05-15T10:30:00.000Z',
    description: 'Fecha en la que la organización fue registrada en el sistema',
    type: String,
    format: 'date-time',
  })
  fecha_registro: Date;

  @ApiProperty({
    description: 'Fecha del último cambio realizado en la cuenta',
    example: '2026-02-21T21:54:00.000Z',
  })
  ultimo_cambio: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última conexión del usuario',
    example: '2026-02-22T11:55:00.000Z',
  })
  ultima_conexion: Date;
}
