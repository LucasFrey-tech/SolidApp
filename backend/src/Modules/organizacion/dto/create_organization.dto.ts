import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateOrganizacionDto {
  @ApiProperty({
    example: '30-71234567-8',
    description: 'Número de documento o CUIT de la organización',
  })
  cuit: string;

  @ApiProperty({
    example: 'Fundación Ayudar',
    description: 'Razón social de la organización',
  })
  razon_Social: string;

  @ApiProperty({
    example: 'Ayudar',
    description: 'Nombre de fantasía de la organización',
  })
  nombre_Organizacion: string;

  @ApiProperty({
    example: 'Organización dedicada a campañas solidarias y ayuda comunitaria',
    description: 'Descripción general de la organización',
  })
  descripcion: string;

  @ApiPropertyOptional({
    example: 'Av. Siempre Viva',
    description: 'Calle donde reside la organizacion',
  })
  calle?: string;
  @ApiPropertyOptional({
    example: 'Av. Siempre Viva',
    description: 'Numero de Calle donde reside la organizacion',
  })
  numero?: string;

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
    example: 'correo@dominio.com',
    description: 'Correo electronico del usuario de la empresa.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El correo es obligatorio.' })
  @MaxLength(255, {
    message: 'El correo no puede superar los 255 caracteres.',
  })
  correo: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario de la empresa.',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MaxLength(255, {
    message: 'La contraseña no puede superar los 255 caracteres',
  })
  clave: string;
}
