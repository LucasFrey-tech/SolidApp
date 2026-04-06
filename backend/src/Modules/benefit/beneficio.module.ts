import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficioController } from './beneficio.controller';
import { BeneficioService } from './beneficio.service';
import { Beneficios } from '../../Entities/beneficio.entity';
import { Empresa } from '../../Entities/empresa.entity';
import { EmpresaModule } from '../empresa/empresa.module';

/**
 * Módulo de NestJS que agrupa los componentes realcionados a Beneficios:
 * - Controlador
 * - Servicio
 * - Repositorios TypeORM
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Beneficios, Empresa]),
    forwardRef(() => EmpresaModule),
  ],

  controllers: [BeneficioController],
  providers: [BeneficioService],
  exports: [BeneficioService],
})
export class BeneficioModule {}
