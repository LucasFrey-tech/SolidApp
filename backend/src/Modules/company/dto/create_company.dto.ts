import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  MaxLength, 
  IsBoolean, 
  IsOptional,
  Matches 
} from 'class-validator';

export class CreateCompanyDTO {
  @ApiProperty({ 
    example: '20-04856975-3', 
    description: 'CUIL de la Empresa (formato: XX-XXXXXXXX-X)' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  @Matches(/^\d{2}-\d{8}-\d{1}$/, {
    message: 'El CUIL debe tener el formato XX-XXXXXXXX-X'
  })
  nroDocumento: string;

  @ApiProperty({
    example: 'Supermercados Unidos S.A.',
    description: 'Razón social registrada de la empresa'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  razon_social: string;

  @ApiProperty({
    example: 'SuperUnidos',
    description: 'Nombre comercial o de fantasía',
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nombre_fantasia?: string;

  @ApiProperty({
    example: 'Supermercados Unidos impulsa la solidaridad mediante bonificaciones...',
    description: 'Descripción de la empresa y su participación'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion: string;

  @ApiProperty({ 
    example: 'Supermercado', 
    description: 'Rubro principal de la empresa' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  rubro: string;

  @ApiProperty({
    example: '+54 11 4567-8900',
    description: 'Teléfono de contacto'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  telefono: string;

  @ApiProperty({
    example: 'Calle falsa 123',
    description: 'Dirección física de la empresa'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  direccion: string;

  @ApiProperty({
    example: 'www.supermercadosunidos.com.ar',
    description: 'Sitio web oficial',
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  web?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si la empresa está verificada',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  verificada?: boolean;
}