import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficioController } from './beneficio.controller';
import { BeneficioService } from './beneficio.service';
import { Beneficios } from '../../Entities/beneficio.entity';
import { Empresa } from '../../Entities/perfil_empresa.entity';

/**
 * Módulo de NestJS que agrupa los componentes realcionados a Beneficios:
 * - Controlador
 * - Servicio
 * - Repositorios TypeORM
 */
@Module({
  imports: [TypeOrmModule.forFeature([Beneficios, Empresa])],
  controllers: [BeneficioController],
  providers: [BeneficioService],
  exports: [BeneficioService],
})
export class BeneficioModule {}
