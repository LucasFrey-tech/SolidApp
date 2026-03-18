import { ApiProperty } from '@nestjs/swagger';
import { EmpresaSummaryDTO } from '../../empresa/dto/summary_empresa.dto';
import { UsuarioResumenDto } from '../../user/dto/response_usuario.dto';

/**
 * DTO para la respuesta de los Beneficios.
 */
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

  @ApiProperty({ example: 100, description: 'Valor del beneficio' })
  valor: number;

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

  @ApiProperty({ example: 'Estado del Descuento', description: 'Estado' })
  estado: string;

  @ApiProperty({
    description: 'Usuario que creó el beneficio',
    type: () => UsuarioResumenDto,
    required: false,
    example: {
      id: 5,
      nombre: 'Juan',
      apellido: 'Pérez',
    },
  })
  creado_por?: UsuarioResumenDto;

  @ApiProperty({
    description: 'Usuario que actualizó el beneficio por última vez',
    type: () => UsuarioResumenDto,
    required: false,
    example: {
      id: 5,
      nombre: 'Juan',
      apellido: 'Pérez',
    },
  })
  actualizado_por?: UsuarioResumenDto;
}
