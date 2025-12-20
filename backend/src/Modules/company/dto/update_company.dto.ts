import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDTO } from './create_company.dto';
import { IsOptional, MaxLength } from 'class-validator';

export class UpdateCompanyDTO extends PartialType(CreateCompanyDTO) {
  @ApiProperty({
    example: false,
    description: 'Indica si la empresa está deshabilitada',
    required: false
  })
  @IsOptional()
  deshabilitado?: boolean;
}