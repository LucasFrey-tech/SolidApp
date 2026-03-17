import { ApiProperty } from '@nestjs/swagger';
import { ContactoDto, DireccionDto } from '../../contacto_direccion/dto';
import { UsuarioResumenDto } from '../../user/dto/response_usuario.dto';

export class EmpresaResponseDTO {
  @ApiProperty({ example: 1, description: 'ID único de la Empresa' })
  id: number;

  @ApiProperty({ example: '20-04856975-3', description: 'CUIL de la Empresa' })
  cuit: string;

  @ApiProperty({
    example: 'Supermercados Unidos S.A.',
    description: 'Razón social',
  })
  razon_social: string;

  @ApiProperty({ example: 'SuperUnidos', description: 'Nombre de fantasía' })
  nombre_empresa: string;

  @ApiProperty({
    example: 'Supermercados Unidos impulsa la solidaridad...',
    description: 'Descripción',
  })
  descripcion: string;

  @ApiProperty({ example: 'Supermercado', description: 'Rubro' })
  rubro: string;

  @ApiProperty({
    description:
      'Datos completos de la dirección de la empresa, incluyendo calle, número, ciudad y código postal.',
    type: DireccionDto,
    example: {
      calle: 'Av. Siempre Viva',
      numero: 742,
      ciudad: 'Springfield',
      codigoPostal: '1234',
    },
  })
  direccion?: DireccionDto;

  @ApiProperty({
    description: 'Información de contacto, como teléfono y correo electrónico.',
    type: ContactoDto,
    example: {
      telefono: '+54 11 1234-5678',
      email: 'cliente@ejemplo.com',
    },
  })
  contacto?: ContactoDto;

  @ApiProperty({
    example: 'www.supermercadosunidos.com.ar',
    description: 'Sitio web',
  })
  web?: string;

  @ApiProperty({ example: true, description: 'Empresa verificada' })
  verificada: boolean;

  @ApiProperty({ example: false, description: 'Empresa deshabilitada' })
  habilitada: boolean;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de registro',
  })
  fecha_registro: Date;

  @ApiProperty({ type: UsuarioResumenDto, required: false })
  creado_por?: UsuarioResumenDto;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de última modificación',
  })
  ultimo_cambio: Date;

  @ApiProperty({ type: UsuarioResumenDto, required: false })
  actualizado_por?: UsuarioResumenDto;

  @ApiProperty({
    example: '/Logo.png',
    description: 'Logo de la empresa',
  })
  logo?: string;
}
