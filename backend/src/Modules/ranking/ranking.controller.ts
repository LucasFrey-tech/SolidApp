import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RankingService } from './ranking.service';
import { RankingDTO } from './dto/ranking.dto';
import { Public } from '../auth/decoradores/auth.decorador';

/**
 * Controlador para gestionar las operaciones del Ranking.
 */
@ApiTags('Ranking')
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  /**
   * Obtiene a los diez Usuarios con mayor puntaje acumulado.
   *
   * @returns {Promise<RankingDTO[]>} Lista de los 10 usuarios con mayor puntaje acumulado.
   */
  @Public()
  @Get('top')
  @ApiOperation({ summary: 'Obtener Top 10 usuarios por puntaje' })
  @ApiResponse({
    status: 200,
    description: 'Top 10 de usaurios',
    type: RankingDTO,
    isArray: true,
  })
  getTop10(): Promise<RankingDTO[]> {
    return this.rankingService.getTop10();
  }
}
