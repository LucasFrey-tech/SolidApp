import { ResponseDonationDto } from './response_donation.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedDonationsResponseDto {
  @ApiProperty({ type: [ResponseDonationDto] })
  items: ResponseDonationDto[];

  @ApiProperty({ example: 42 })
  total: number;
}
