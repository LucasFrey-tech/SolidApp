import { Module } from '@nestjs/common';
import { CampaignsController } from './campaign.controller';
import { CampaignsService } from './campaign.service';
import { Campaigns } from '../../Entities/campaigns.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organizacion } from '../../Entities/organizacion.entity';
import { imagenes_campania } from '../../Entities/imagenes_campania.entity';
import { CommonMulterModule } from '../../common/multer/multer.module';

/**
 * Módulo de NestJS que agrupa los componentes realcionados a Campañas:
 * - Controlador
 * - Servicio
 * - Repositorios TypeORM
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Campaigns, Organizacion, imagenes_campania]),
    CommonMulterModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignModule {}
