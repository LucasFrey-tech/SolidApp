import { Module } from '@nestjs/common';
import { CampaignsController } from './campaign.controller';
import { CampaignsService } from './campaign.service';
import { Campaigns } from '../../Entities/campaigns.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Campaigns])],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignModule {}
