import { Module } from '@nestjs/common';
import { CampaignsController } from './campaign.controller';
import { CampaignsService } from './campaign.service';
import { Campaigns } from '../../Entities/campaigns.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilOrganizacion } from '../../Entities/perfil_organizacion.entity';
import { Campaigns_images } from '../../Entities/campaigns_images.entity';
import { CommonMulterModule } from '../../common/multer/multer.module';

/**
 * Módulo de NestJS que agrupa los componentes realcionados a Campañas:
 * - Controlador
 * - Servicio
 * - Repositorios TypeORM
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Campaigns, PerfilOrganizacion, Campaigns_images]),
    CommonMulterModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignModule {}
