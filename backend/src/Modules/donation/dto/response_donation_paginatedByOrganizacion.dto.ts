import { ApiProperty } from '@nestjs/swagger';
import { OrganizationDonationItemDto } from './organization_donation_item.dto';

export class PaginatedOrganizationDonationsResponseDto {
  @ApiProperty({ type: [OrganizationDonationItemDto] })
  items: OrganizationDonationItemDto[];

  @ApiProperty({ example: 42 })
  total: number;
}
