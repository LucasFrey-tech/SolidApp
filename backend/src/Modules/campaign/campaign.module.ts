import { Module } from '@nestjs/common';
import { CampaignsController } from './campaign.controller';
import { CampaignsService } from './campaign.service';
import { Campaigns } from '../../Entities/campaigns.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organizations } from '../../Entities/organizations.entity';
import { Campaigns_images } from '../../Entities/campaigns_images.entity';

/**
 * Módulo de NestJS que agrupa los componentes realcionados a Campañas:
 * - Controlador
 * - Servicio
 * - Repositorios TypeORM
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Campaigns, Organizations, Campaigns_images]),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignModule {}
