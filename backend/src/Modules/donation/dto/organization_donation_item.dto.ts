import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DonacionEstado } from '../enum';
import { UsuarioResumenDto } from '../../user/dto/response_usuario.dto';

/**
 * DTO de la Donación.
 */
export class OrganizationDonationItemDto {
  @ApiProperty({ example: 15 })
  id: number;

  @ApiProperty({
    example: 'Arroz, fideos y enlatados',
    description: 'Detalle de la donación',
  })
  descripcion: string;

  @ApiProperty({
    example: 500,
    description: 'Puntos asignados a la donación',
  })
  puntos: number;

  @ApiProperty({
    enum: DonacionEstado,
    example: DonacionEstado.PENDIENTE,
  })
  estado: DonacionEstado;

  @ApiProperty({ example: 12 })
  userId: number;

  @ApiProperty({ example: 'usuario@mail.com' })
  correo: string;

  @ApiProperty({ example: 3 })
  campaignId: number;

  @ApiProperty({ example: 'Campaña Invierno Solidario' })
  campaignTitulo: string;

  @ApiProperty({ example: '20/02/26' })
  fecha_estado?: Date;

  @ApiProperty({ example: 'objetivo' })
  cantidad: number;

  @ApiPropertyOptional({ type: () => UsuarioResumenDto })
  creado_por?: UsuarioResumenDto;

  @ApiPropertyOptional({ type: () => UsuarioResumenDto })
  aprobado_por?: UsuarioResumenDto;

  @ApiPropertyOptional()
  fecha_aprobacion?: Date;

  @ApiPropertyOptional({ type: () => UsuarioResumenDto })
  rechazado_por?: UsuarioResumenDto;

  @ApiPropertyOptional()
  fecha_rechazo?: Date;

  @ApiPropertyOptional()
  motivo_rechazo?: string;
}
