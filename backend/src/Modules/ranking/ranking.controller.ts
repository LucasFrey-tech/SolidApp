import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RankingService } from './ranking.service';
import { RankingDTO } from './dto/ranking.dto';

@ApiTags('Ranking')
@Controller('ranking')
export class RankingController {
    constructor(private readonly rankingService: RankingService) {}

    @Get('top10')
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