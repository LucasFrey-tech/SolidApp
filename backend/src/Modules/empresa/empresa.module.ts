import { Module } from '@nestjs/common';
import { EmpresaController } from './empresa.controller';
import { EmpresasService } from './empresa.service';
import { Empresa } from '../../Entities/empresa.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa])],
  controllers: [EmpresaController],
  providers: [EmpresasService],
  exports: [EmpresasService],
})
export class EmpresaModule {}
