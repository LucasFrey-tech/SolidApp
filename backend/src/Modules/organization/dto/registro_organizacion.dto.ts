import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistroOrganizacionDto {
  @ApiProperty({ example: '30-87654321-0' })
  @IsString()
  cuit_organizacion: string;

  @ApiProperty({ example: 'Fundación Esperanza' })
  @IsString()
  razon_social: string;

  @ApiProperty({ example: 'Fundación Esperanza' })
  @IsString()
  nombre_organizacion: string;
}
