import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitController } from './benefit.controller';
import { BenefitService } from './beneficio.service';
import { Benefits } from '../../Entities/beneficio.entity';
import { Empresa } from '../../Entities/empresa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Benefits, Empresa])],
  controllers: [BenefitController],
  providers: [BenefitService],
  exports: [BenefitService],
})
export class BenefitModule {}
