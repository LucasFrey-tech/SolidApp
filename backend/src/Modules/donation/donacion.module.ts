import { Module } from '@nestjs/common';
import { DonationsController } from './donacion.controller';
import { DonacionService } from './donacion.service';
import { Donaciones } from '../../Entities/donacion.entity';
import { Donation_images } from '../../Entities/donation_images.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaigns } from '../../Entities/campaigns.entity';
import { PerfilUsuario } from '../../Entities/perfil_Usuario.entity';
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
      Donaciones,
      Campaigns,
      PerfilUsuario,
      RankingDonador,
      Donation_images,
    ]),
    RankingModule,
  ],
  controllers: [DonationsController],
  providers: [DonacionService],
  exports: [DonacionService],
})
export class DonationModule {}
