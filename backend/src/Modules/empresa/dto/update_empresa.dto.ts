import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaDTO } from './create_empresa.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEmpresaDTO extends PartialType(CreateEmpresaDTO) {
  @ApiProperty({
    example: false,
    description: 'Indica si la empresa está deshabilitada',
    required: false,
  })
  @IsOptional()
  deshabilitado?: boolean;

  @ApiProperty({
    example: '/resources/empresas/logo123.png',
    description: 'Ruta del logo de la empresa',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  logo?: string;
}
