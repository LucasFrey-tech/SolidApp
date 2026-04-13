import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficioController } from './beneficio.controller';
import { BeneficioService } from './beneficio.service';
import { Beneficios } from '../../Entities/beneficio.entity';
import { Empresa } from '../../Entities/empresa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Beneficios, Empresa])],
  controllers: [BeneficioController],
  providers: [BeneficioService],
  exports: [BeneficioService],
})
export class BeneficioModule {}
