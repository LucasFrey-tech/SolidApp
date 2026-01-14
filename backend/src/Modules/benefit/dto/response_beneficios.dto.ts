import { ApiProperty } from '@nestjs/swagger';
import { EmpresaSummaryDTO } from '../../empresa/dto/summary_empresa.dto';

export class BeneficiosResponseDTO {
  @ApiProperty({ example: 1, description: 'ID del beneficio' })
  id: number;

  @ApiProperty({ example: 'Descuento del 15%', description: 'Título' })
  titulo: string;

  @ApiProperty({ example: 'Discount', description: 'Tipo' })
  tipo: string;

  @ApiProperty({ example: 'Descuento en supermercado', description: 'Detalle' })
  detalle: string;

  @ApiProperty({ example: 50, description: 'Cantidad disponible' })
  cantidad: number;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de registro',
  })
  fecha_registro: Date;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de última modificación',
  })
  ultimo_cambio: Date;

  @ApiProperty({
    type: () => EmpresaSummaryDTO,
    description: 'Información resumida de la empresa',
  })
  empresa: EmpresaSummaryDTO;
}
