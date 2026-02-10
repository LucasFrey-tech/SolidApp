import { ApiProperty } from '@nestjs/swagger';
import { OrganizationDonationItemDto } from './donation_item.dto';

export class PaginatedDonationsResponseDto {
  @ApiProperty({ type: [OrganizationDonationItemDto] })
  items: OrganizationDonationItemDto[];

  @ApiProperty({ example: 42 })
  total: number;
}
