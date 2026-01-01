import { Module } from '@nestjs/common';
import { DonationsController } from './donation.controller';
import { DonationsService } from './donation.service';
import { Donations } from '../../Entities/donations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonorModule } from '../donor/donor.module';

@Module({
  imports: [TypeOrmModule.forFeature([Donations]), DonorModule],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationModule {}
