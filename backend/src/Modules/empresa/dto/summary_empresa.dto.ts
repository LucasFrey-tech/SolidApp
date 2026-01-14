import { ApiProperty } from '@nestjs/swagger';

export class EmpresaSummaryDTO {
  @ApiProperty({ example: 1, description: 'ID único de la Empresa' })
  id: number;

  @ApiProperty({
    example: 'Supermercados Unidos S.A.',
    description: 'Razón social',
  })
  razon_social: string;

  @ApiProperty({ example: 'SuperUnidos', description: 'Nombre de fantasía' })
  nombre_fantasia: string;

  @ApiProperty({ example: 'Supermercado', description: 'Rubro' })
  rubro: string;

  @ApiProperty({ example: true, description: 'Empresa verificada' })
  verificada: boolean;

  @ApiProperty({ example: false, description: 'Empresa deshabilitada' })
  deshabilitado: boolean;
}
