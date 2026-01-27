import { Module } from '@nestjs/common';
import { CampañasController } from './campaña.controller';
import { CampañaService } from './campaña.service';
import { Campañas } from '../../Entities/campañas.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organizacion } from '../../Entities/organizacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campañas, Organizacion])],
  controllers: [CampañasController],
  providers: [CampañaService],
  exports: [CampañaService],
})
export class CampaignModule {}
