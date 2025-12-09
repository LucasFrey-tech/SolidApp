import { Module } from '@nestjs/common';
import { DonorsController } from './donor.controller';
import { DonorsService } from './donor.service';
import { Donor } from '../../Entities/donor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Donor])],
  controllers: [DonorsController],
  providers: [DonorsService],
  exports: [DonorsService],
})
export class UserModule {}
