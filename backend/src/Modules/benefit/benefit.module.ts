import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitController } from './benefit.controller';
import { BenefitService } from './benefit.service';
import { Benefits } from '../../Entities/benefits.entity';
import { Companies } from 'src/Entities/companies.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Benefits, Companies])],
  controllers: [BenefitController],
  providers: [BenefitService],
  exports: [BenefitService],
})
export class BenefitModule {}
