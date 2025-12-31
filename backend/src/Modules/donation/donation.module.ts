import { Module } from '@nestjs/common';
import { DonationsController } from './donation.controller';
import { DonationsService } from './donation.service';
import { Donations } from '../../Entities/donations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Donations])],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class UserModule {}
