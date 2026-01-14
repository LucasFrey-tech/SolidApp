import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaDTO } from './create_empresa.dto';
import { IsOptional } from 'class-validator';

export class UpdateEmpresaDTO extends PartialType(CreateEmpresaDTO) {
  @ApiProperty({
    example: false,
    description: 'Indica si la empresa está deshabilitada',
    required: false,
  })
  @IsOptional()
  deshabilitado?: boolean;
}
