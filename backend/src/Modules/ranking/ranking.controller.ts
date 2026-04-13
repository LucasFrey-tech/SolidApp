import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RankingService } from './ranking.service';
import { RankingDTO } from './dto/ranking.dto';
import { Public } from '../auth/decoradores/auth.decorador';

@ApiTags('Ranking')
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

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
