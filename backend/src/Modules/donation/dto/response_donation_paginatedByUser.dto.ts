import { ApiProperty } from '@nestjs/swagger';
import { UserDonationItemDto } from './usuario_donation_item.dto';

export class PaginatedUserDonationsResponseDto {
  @ApiProperty({ type: [UserDonationItemDto] })
  items: UserDonationItemDto[];

  @ApiProperty({ example: 42 })
  total: number;
}
