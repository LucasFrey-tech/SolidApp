import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';
import { RankingDonador } from '../../Entities/ranking.entity';

/**
 * Módulo de NestJS que agrupa los componentes relacionados a Ranking:
 * - Controlador
 * - Servicio
 * - Repositorios TypeORM
 */
@Module({
  imports: [TypeOrmModule.forFeature([RankingDonador])],
  controllers: [RankingController],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
