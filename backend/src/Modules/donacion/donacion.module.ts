import { Module } from '@nestjs/common';
import { DonationsController } from './donacion.controller';
import { DonationsService } from './donacion.service';
import { Donaciones } from '../../Entities/donaciones.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campañas } from '../../Entities/campañas.entity';
import { Usuario } from '../../Entities/usuario.entity';
import { RankingDonador } from '../../Entities/ranking.entity';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donaciones, Campañas, Usuario, RankingDonador]),
    RankingModule,
  ],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationModule {}
