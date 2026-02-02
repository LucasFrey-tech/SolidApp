import { ApiProperty } from '@nestjs/swagger';
import { ResponseCampaignsDto } from './response_campaigns.dto';

export class ResponseCampaignsPaginatedDto {
  @ApiProperty({ type: [ResponseCampaignsDto] })
  items: ResponseCampaignsDto[];

  @ApiProperty({ example: 42 })
  total: number;
}
