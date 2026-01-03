import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DonorsService } from './donor.service';
import { TopDonorResponseDto } from './dto/top_donor_response.dto';
@ApiTags('Donadores')
@Controller('donors')
export class DonorsController {
  constructor(private readonly donorService: DonorsService) {}

  /**
   * Obtiene el ranking de los donadores con mayor monto total donado.
   *
   * @param limit Cantidad máxima de donadores a devolver (por defecto 3)
   */
  @Get('top')
  @ApiOperation({
    summary: 'Obtener ranking de donadores',
    description: 'Devuelve los donadores con mayor monto total donado',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad máxima de donadores a mostrar',
    example: 3,
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking de donadores',
    type: TopDonorResponseDto,
    isArray: true,
  })
  getTopDonors(
    @Query('limit', new ParseIntPipe({ optional: true }), ParseIntPipe)
    limit = 5,
  ): Promise<TopDonorResponseDto[]> {
    return this.donorService.getTopDonors(limit);
  }
}
