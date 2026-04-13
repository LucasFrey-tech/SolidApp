import { ApiProperty } from '@nestjs/swagger';
import { ResponseCampaignsDto } from './response_campaigns.dto';
import { ResponseCampaignDetalleDto } from './response_campaignDetalle.dto';

export class ResponseCampaignsPaginatedDto {
  @ApiProperty({ type: [ResponseCampaignsDto] })
  items: ResponseCampaignsDto[];

  @ApiProperty({ example: 42 })
  total: number;
}

export class ResponseCampaignsDetailPaginatedDto {
  @ApiProperty({ type: [ResponseCampaignDetalleDto] })
  items: ResponseCampaignDetalleDto[];

  @ApiProperty({ example: 42 })
  total: number;
}
