import { Module } from '@nestjs/common';
import { BenefitsController } from './benefit.controller';
import { BenefitsService } from './benefit.service';
import { Benefit } from '../../Entities/benefits.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Benefit])],
  controllers: [BenefitsController],
  providers: [BenefitsService],
  exports: [BenefitsService],
})
export class UserModule {}
