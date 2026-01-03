import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({
    example: '30-71234567-8',
    description: 'Número de documento o CUIT de la organización',
  })
  nroDocumento?: string;

  @ApiPropertyOptional({
    example: 'Fundación Ayudar',
    description: 'Razón social de la organización',
  })
  razonSocial?: string;

  @ApiPropertyOptional({
    example: 'Ayudar',
    description: 'Nombre de fantasía de la organización',
  })
  nombreFantasia?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si la organización fue verificada por el sistema',
  })
  verificada?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si la organización se encuentra deshabilitada',
  })
  deshabilitado?: boolean;

  @ApiPropertyOptional({
    example: 'Organización dedicada a campañas solidarias y ayuda comunitaria',
    description: 'Descripción general de la organización',
  })
  descripcion?: string;

  @ApiPropertyOptional({
    example: '+54 11 4567-8900',
    description: 'Número de teléfono de contacto de la organización',
  })
  telefono?: string;

  @ApiPropertyOptional({
    example: 'https://www.fundacionayudar.org',
    description: 'Sitio web oficial de la organización',
  })
  web?: string;
}
