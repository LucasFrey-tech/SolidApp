import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({
    example: '30-71234567-8',
    description: 'Número de documento o CUIT de la organización',
  })
  @IsOptional()
  @IsString()
  nroDocumento?: string;

  @ApiPropertyOptional({
    example: 'Fundación Ayudar',
    description: 'Razón social de la organización',
  })
  @IsOptional()
  @IsString()
  razonSocial?: string;

  @ApiPropertyOptional({
    example: 'Ayudar',
    description: 'Nombre de fantasía de la organización',
  })
  @IsOptional()
  @IsString()
  nombreFantasia?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si la organización fue verificada por el sistema',
  })
  @IsOptional()
  verificada?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si la organización se encuentra deshabilitada',
  })
  @IsOptional()
  deshabilitado?: boolean;

  @ApiPropertyOptional({
    example: 'Organización dedicada a campañas solidarias y ayuda comunitaria',
    description: 'Descripción general de la organización',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @ApiPropertyOptional({
    example: '+54 11 4567-8900',
    description: 'Número de teléfono de contacto de la organización',
  })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  telefono?: string;

  @ApiPropertyOptional({
    example: 'https://www.fundacionayudar.org',
    description: 'Sitio web oficial de la organización',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  web?: string;

  // AGREGAR ESTOS CAMPOS FALTANTES:
  @ApiPropertyOptional({
    example: 'Calle Falsa 123',
    description: 'Dirección de la organización',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @ApiPropertyOptional({
    example: 'contacto@organizacion.org',
    description: 'Correo electrónico de la organización',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  correo?: string;
}
