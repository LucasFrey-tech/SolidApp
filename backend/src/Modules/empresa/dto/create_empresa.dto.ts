import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateEmpresaDTO {
  @ApiProperty({
    example: '20-04856975-3',
    description: 'CUIL de la Empresa (formato: XX-XXXXXXXX-X)',
  })
  @IsString()
  @IsNotEmpty({ message: 'El CUIL es Obligatorio' })
  @MaxLength(13, { message: 'El CUIL no puede superar los 13 caracteres' })
  @Matches(/^\d{2}-\d{8}-\d{1}$/, {
    message: 'El CUIL debe tener el formato XX-XXXXXXXX-X',
  })
  cuit_empresa: string;

  @ApiProperty({
    example: 'Supermercados Unidos S.A.',
    description: 'Razón social registrada de la empresa',
  })
  @IsString()
  @IsNotEmpty({ message: 'La Razon Social es Obligatoria' })
  @MaxLength(255, {
    message: 'La razon social no puede superar los 255 caracteres',
  })
  razon_social: string;

  @ApiProperty({
    example: 'SuperUnidos',
    description: 'Nombre comercial o de fantasía',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, {
    message: 'El nombre ficticio no puede superar los 50 caracteres',
  })
  nombre_fantasia?: string;

  @ApiProperty({
    example:
      'Supermercados Unidos impulsa la solidaridad mediante bonificaciones...',
    description: 'Descripción de la empresa y su participación',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es Obligatoria' })
  @MaxLength(255, {
    message: 'La descripción no puede superar los 255 caracteres',
  })
  descripcion: string;

  @ApiProperty({
    example: 'Supermercado',
    description: 'Rubro principal de la empresa',
  })
  @IsString()
  @IsOptional()
  @MaxLength(15, { message: 'El Rubro no puede superar los 15 caracteres' })
  rubro?: string;

  @ApiProperty({
    example: '+54 11 4567-8900',
    description: 'Teléfono de contacto',
  })
  @IsString()
  @IsNotEmpty({ message: 'El telefono de contacto es Obligatorio' })
  @MaxLength(25, { message: 'El Telefono no puede superar los 25 caracteres' })
  telefono: string;

  @ApiProperty({
    example: 'Calle falsa 123',
    description: 'Dirección física de la empresa',
  })
  @IsString()
  @IsNotEmpty({ message: 'La dirección es Oligatoria' })
  @MaxLength(255, {
    message: 'La dirección no puede superar los 255 caracteres',
  })
  direccion: string;

  @ApiProperty({
    example: 'www.supermercadosunidos.com.ar',
    description: 'Sitio web oficial',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(150, {
    message: 'La dirección no puede superar los 150 caracteres',
  })
  web?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si la empresa está verificada',
    default: false,
  })
  @IsBoolean({ message: 'Él campo Verificada debe ser booleano' })
  @IsOptional()
  verificada?: boolean;

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
  @IsNotEmpty({ message: 'El correo es Oligatorio.' })
  @MaxLength(255, {
    message: 'El correo no puede superar los 255 caracteres',
  })
  clave: string;
}
