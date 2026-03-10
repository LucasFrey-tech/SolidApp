import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ContactoDto {
  @ApiProperty({
    example: 1,
    description: 'ID único del contacto (auto-generado)',
  })
  id: number;

  @ApiProperty({
    example: 'juan.perez@example.com',
    description: 'Email de contacto',
  })
  @IsEmail({}, { message: 'Debe proporcionar un correo válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @ApiPropertyOptional({
    example: '11',
    description: 'Prefijo telefónico',
  })
  @IsOptional()
  @IsString()
  @Length(1, 5)
  prefijo?: string;

  @ApiPropertyOptional({
    example: '12345678',
    description: 'Número de teléfono',
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  telefono?: string;

  @ApiPropertyOptional({
    example: 'Principal',
    description: 'Tipo de contacto',
  })
  @IsOptional()
  @IsString()
  tipo?: string;
}

export class DireccionDto {
  @ApiProperty({
    example: 1,
    description: 'ID único de la dirección (auto-generado)',
  })
  id: number;

  @ApiPropertyOptional({
    example: 'Av. Corrientes',
    description: 'Calle',
  })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  calle?: string;

  @ApiPropertyOptional({
    example: '1234',
    description: 'Número',
  })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  numero?: string;

  @ApiPropertyOptional({
    example: 'Piso 5, Dpto B',
    description: 'Información adicional',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  adicional?: string;

  @ApiPropertyOptional({
    example: 'C1043',
    description: 'Código postal',
  })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  codigo_postal?: string;

  @ApiPropertyOptional({
    example: 'Buenos Aires',
    description: 'Ciudad',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  ciudad?: string;

  @ApiPropertyOptional({
    example: 'CABA',
    description: 'Provincia',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  provincia?: string;
}
