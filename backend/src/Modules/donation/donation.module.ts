import { Module } from '@nestjs/common';
import { DonationsController } from './donation.controller';
import { DonationsService } from './donation.service';
import { Donations } from '../../Entities/donacion.entity';
import { Donation_images } from '../../Entities/donation_images.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaigns } from '../../Entities/campaigns.entity';
import { Usuario } from '../../Entities/perfil_Usuario.entity';
import { RankingDonador } from '../../Entities/ranking.entity';
import { RankingModule } from '../ranking/ranking.module';

/**
 * Módulo de NestJS que agrupa los componentes relacionados a Donaciones:
 * - Controlador
 * - Servicio
 * - Repositorio TypeORM
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Donations,
      Campaigns,
      Usuario,
      RankingDonador,
      Donation_images,
    ]),
    RankingModule,
  ],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationModule {}
