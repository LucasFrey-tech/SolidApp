import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({
    example: '30-71234567-8',
    description: 'Número de documento o CUIT de la organización',
  })
  cuit_organizacion: string;

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
    example: 'https://www.fundacionayudar.org',
    description: 'Sitio web oficial de la organización',
  })
  web?: string;
}
