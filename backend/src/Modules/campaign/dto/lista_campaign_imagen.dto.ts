import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para listar las Imágenes de las Donaciones
 */
export class CampaignImagenDTO {
  /** ID de la Imágen de la Donación */
  @ApiProperty({ example: 1, description: 'ID único de la imágen' })
  id: number;

  /** Nombre de la Imágen de la Donación */
  @ApiProperty({
    example: 'Campaña de Caritas, Donacion de Sillas',
    description: 'Nombre',
  })
  nombre: string;

  /** Ruta de la Imágen de la Donación */
  @ApiProperty({
    example: '/uploads/bb-logo.png',
    description: 'path de la imagen de la donacion',
  })
  logo: string;
}
