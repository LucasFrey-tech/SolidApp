import { ApiProperty } from '@nestjs/swagger';
import { CampaignImagenDTO } from './lista_campaign_imagen.dto';
import { ResponseCampaignsDto } from './response_campaigns.dto';

export class ResponseCampaignDetalleDto extends ResponseCampaignsDto {
  @ApiProperty({
    type: () => CampaignImagenDTO,
    isArray: true,
    description: 'Imágenes asociadas a la campaña',
  })
  imagenes: CampaignImagenDTO[];
}
