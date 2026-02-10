import { ApiProperty } from '@nestjs/swagger';
import { EmpresaSummaryDTO } from '../../empresa/dto/summary_empresa.dto';

/** 
 * DTO para la respuesta de los Beneficios.
 */
export class BeneficiosResponseDTO {

  /** ID del Beneficio */
  @ApiProperty({ example: 1, description: 'ID del beneficio' })
  id: number;

  /** Título del Beneficio */
  @ApiProperty({ example: 'Descuento del 15%', description: 'Título' })
  titulo: string;

  /** Tipo del Beneficio */
  @ApiProperty({ example: 'Discount', description: 'Tipo' })
  tipo: string;

  /** Descripción del Beneficio */
  @ApiProperty({ example: 'Descuento en supermercado', description: 'Detalle' })
  detalle: string;

  /** Cantidad disponible del Beneficio */
  @ApiProperty({ example: 50, description: 'Cantidad disponible' })
  cantidad: number;

  /** Valor de canje del Beneficio */
  @ApiProperty({ example: 100, description: 'Valor del beneficio' })
  valor: number;

  /** Fecha de creación del Beneficio */
  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de registro',
  })
  fecha_registro: Date;

  /** Fecha de modificación del Beneficio */
  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de última modificación',
  })
  ultimo_cambio: Date;

  /** Información de la Empresa */
  @ApiProperty({
    type: () => EmpresaSummaryDTO,
    description: 'Información resumida de la empresa',
  })
  empresa: EmpresaSummaryDTO;

  /** Estado del Beneficio */
  @ApiProperty({ example: 'Estado del Descuento', description: 'Estado' })
  estado: string;
}
