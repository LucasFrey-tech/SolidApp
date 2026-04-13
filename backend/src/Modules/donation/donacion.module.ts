import { Module } from '@nestjs/common';
import { DonacionService } from './donacion.service';
import { Donaciones } from '../../Entities/donacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaigns } from '../../Entities/campaigns.entity';
import { Usuario } from '../../Entities/usuario.entity';
import { RankingDonador } from '../../Entities/ranking.entity';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donaciones, Campaigns, Usuario, RankingDonador]),
    RankingModule,
  ],
  providers: [DonacionService],
  exports: [DonacionService],
})
export class DonacionModule {}
