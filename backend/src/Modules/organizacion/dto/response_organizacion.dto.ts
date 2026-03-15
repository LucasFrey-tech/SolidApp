import { ApiProperty } from '@nestjs/swagger';
import { DireccionDto, ContactoDto } from '../../contacto_direccion/dto';

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
  cuit: string;

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
  habilitada: boolean;

  @ApiProperty({
    example: 'Organización dedicada a campañas solidarias y ayuda comunitaria',
    description: 'Descripción general de la organización',
  })
  descripcion: string;

  @ApiProperty({
    description:
      'Datos completos de la dirección de la organización, incluyendo calle, número, ciudad y código postal.',
    type: DireccionDto,
    example: {
      calle: 'Av. Siempre Viva',
      numero: 742,
      ciudad: 'Springfield',
      codigoPostal: '1234',
    },
  })
  direccion?: DireccionDto;

  @ApiProperty({
    description: 'Información de contacto, como teléfono y correo electrónico.',
    type: ContactoDto,
    example: {
      telefono: '+54 11 1234-5678',
      email: 'cliente@ejemplo.com',
    },
  })
  contacto?: ContactoDto;

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
}
