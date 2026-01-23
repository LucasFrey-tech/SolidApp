import { Module } from '@nestjs/common';
import { DonationsController } from './donation.controller';
import { DonationsService } from './donation.service';
import { Donations } from '../../Entities/donations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaigns } from '../../Entities/campaigns.entity';
import { Usuario } from '../../Entities/usuario.entity';
import { RankingDonador } from '../../Entities/ranking.entity';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [TypeOrmModule.forFeature([Donations, Campaigns, Usuario, RankingDonador]), RankingModule],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationModule {}
