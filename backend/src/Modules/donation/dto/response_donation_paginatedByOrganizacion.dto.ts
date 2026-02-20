import { ApiProperty } from '@nestjs/swagger';
import { OrganizationDonationItemDto } from './organization_donation_item.dto';

/**
 * DTO de la respuesta de la Donación paginada.
 */
export class PaginatedOrganizationDonationsResponseDto {
  /** Datos de las la Donaciones */
  @ApiProperty({ type: [OrganizationDonationItemDto] })
  items: OrganizationDonationItemDto[];

  /** Cantidad de Donaciones */
  @ApiProperty({ example: 42 })
  total: number;
}
