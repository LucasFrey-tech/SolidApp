import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
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
  @MinLength(1, { message: 'El prefijo no puede estar vacío' })
  @Length(1, 5)
  prefijo?: string;

  @ApiPropertyOptional({
    example: '12345678',
    description: 'Número de teléfono',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El teléfono no puede estar vacío' })
  @Length(1, 20)
  telefono?: string;
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
  @MinLength(1, { message: 'La calle no puede estar vacía' })
  @Length(1, 80)
  calle?: string;

  @ApiPropertyOptional({
    example: '1234',
    description: 'Número',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El número no puede estar vacío' })
  @Length(1, 10)
  numero?: string;

  @ApiPropertyOptional({
    example: 'Piso 5, Dpto B',
    description: 'Información adicional',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'La información adicional no puede estar vacía' })
  @Length(1, 100)
  adicional?: string;

  @ApiPropertyOptional({
    example: 'C1043',
    description: 'Código postal',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El Codigo Postal no puede estar vacío' })
  @Length(1, 10)
  codigo_postal?: string;

  @ApiPropertyOptional({
    example: 'Buenos Aires',
    description: 'Ciudad',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'La ciudad no puede estar vacía' })
  @Length(1, 50)
  ciudad?: string;

  @ApiPropertyOptional({
    example: 'CABA',
    description: 'Provincia',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'La provincia no puede estar vacía' })
  @Length(1, 50)
  provincia?: string;
}
