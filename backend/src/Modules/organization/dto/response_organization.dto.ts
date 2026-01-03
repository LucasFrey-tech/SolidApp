import { ApiProperty } from '@nestjs/swagger';

export class ResponseOrganizationDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la organización',
  })
  id: number;

  @ApiProperty({
    example: '30-71234567-8',
    description: 'Número de documento o CUIT de la organización',
  })
  nroDocumento: string;

  @ApiProperty({
    example: 'Fundación Ayudar',
    description: 'Razón social de la organización',
  })
  razonSocial: string;

  @ApiProperty({
    example: 'Ayudar',
    description: 'Nombre de fantasía de la organización',
  })
  nombreFantasia: string;

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
    example: '+54 11 4567-8900',
    description: 'Número de teléfono de contacto de la organización',
  })
  telefono: string;

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
  fechaRegistro: Date;
}
