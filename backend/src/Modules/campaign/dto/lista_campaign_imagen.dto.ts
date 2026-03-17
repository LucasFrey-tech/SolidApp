import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para listar las Imágenes de las Donaciones
 */
export class CampaignImagenDTO {
  @ApiProperty({ example: 1, description: 'ID único de la imágen' })
  id: number;

  @ApiProperty({
    example: 'Campaña de Caritas, Donacion de Sillas',
    description: 'Nombre',
  })
  nombre: string;

  @ApiProperty({
    example: '/uploads/bb-logo.png',
    description: 'path de la imagen de la donacion',
  })
  url: string;
}
