import { ApiProperty } from '@nestjs/swagger';
import { BeneficiosResponseDTO } from './response_beneficios.dto';

/**
 * DTO de la respuesta de los Beneficios paginados.
 */
export class PaginatedBeneficiosResponseDTO {
  /** Datos de los Beneficios */
  @ApiProperty({ type: [BeneficiosResponseDTO] })
  items: BeneficiosResponseDTO[];

  /** Cantidad de Beneficios */
  @ApiProperty({ example: 42 })
  total: number;
}
