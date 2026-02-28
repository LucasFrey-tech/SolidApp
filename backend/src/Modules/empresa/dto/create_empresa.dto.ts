import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
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
  nombre_empresa?: string;

  @ApiProperty({
    example: 'Supermercado',
    description: 'Rubro principal de la empresa',
  })
  @IsString()
  @IsOptional()
  @MaxLength(15, { message: 'El Rubro no puede superar los 15 caracteres' })
  rubro?: string;

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
}
