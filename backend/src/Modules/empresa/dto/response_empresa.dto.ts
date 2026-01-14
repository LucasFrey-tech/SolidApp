import { ApiProperty } from '@nestjs/swagger';

export class EmpresaResponseDTO {
  @ApiProperty({ example: 1, description: 'ID único de la Empresa' })
  id: number;

  @ApiProperty({ example: '20-04856975-3', description: 'CUIL de la Empresa' })
  nroDocumento: string;

  @ApiProperty({
    example: 'Supermercados Unidos S.A.',
    description: 'Razón social',
  })
  razon_social: string;

  @ApiProperty({ example: 'SuperUnidos', description: 'Nombre de fantasía' })
  nombre_fantasia: string;

  @ApiProperty({
    example: 'Supermercados Unidos impulsa la solidaridad...',
    description: 'Descripción',
  })
  descripcion: string;

  @ApiProperty({ example: 'Supermercado', description: 'Rubro' })
  rubro: string;

  @ApiProperty({ example: '+54 11 4567-8900', description: 'Teléfono' })
  telefono: string;

  @ApiProperty({ example: 'Calle falsa 123', description: 'Dirección' })
  direccion: string;

  @ApiProperty({
    example: 'www.supermercadosunidos.com.ar',
    description: 'Sitio web',
  })
  web: string;

  @ApiProperty({ example: true, description: 'Empresa verificada' })
  verificada: boolean;

  @ApiProperty({ example: false, description: 'Empresa deshabilitada' })
  deshabilitado: boolean;

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
}
