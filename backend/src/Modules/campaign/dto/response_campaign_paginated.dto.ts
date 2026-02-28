import { ApiProperty } from '@nestjs/swagger';
import { ResponseCampaignsDto } from './response_campaigns.dto';
import { ResponseCampaignDetalleDto } from './response_campaignDetalle.dto';

/**
 * DTO para la respuesta paginada de las Campañas
 */
export class ResponseCampaignsPaginatedDto {
  /** Datos de las Campañas */
  @ApiProperty({ type: [ResponseCampaignsDto] })
  items: ResponseCampaignsDto[];

  /** Total de las Campañas */
  @ApiProperty({ example: 42 })
  total: number;
}

export class ResponseCampaignsDetailPaginatedDto {
  /** Datos de las Campañas */
  @ApiProperty({ type: [ResponseCampaignDetalleDto] })
  items: ResponseCampaignDetalleDto[];

  /** Total de las Campañas */
  @ApiProperty({ example: 42 })
  total: number;
}
