import { ApiProperty } from '@nestjs/swagger';
import { UserDonationItemDto } from './usuario_donation_item.dto';

/**
 * DTO de la respuesta de la Donación paginada.
 */
export class PaginatedUserDonationsResponseDto {
  /** Datos de las la Donaciones */
  @ApiProperty({ type: [UserDonationItemDto] })
  items: UserDonationItemDto[];

  /** Cantidad de Donaciones */
  @ApiProperty({ example: 42 })
  total: number;
}
