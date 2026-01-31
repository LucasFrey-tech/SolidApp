import { ApiProperty } from '@nestjs/swagger';
import { BeneficiosResponseDTO } from './response_beneficios.dto';

export class PaginatedBeneficiosResponseDTO {
  @ApiProperty({ type: [BeneficiosResponseDTO] })
  items: BeneficiosResponseDTO[];

  @ApiProperty({ example: 42 })
  total: number;
}
