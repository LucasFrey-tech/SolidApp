import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBeneficiosDTO } from './create_beneficios.dto';
import { IsOptional, Min } from 'class-validator';

export class UpdateBeneficiosDTO extends PartialType(CreateBeneficiosDTO) {
  @ApiProperty({
    example: 10,
    description: 'Cantidad disponible',
    required: false,
  })
  @IsOptional()
  @Min(0)
  cantidad?: number;

  @ApiProperty({
    example: 200,
    description: 'Valor del beneficio',
    required: false,
  })
  @IsOptional()
  @Min(0)
  valor?: number;
}
