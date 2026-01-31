import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioBeneficio } from '../../../Entities/usuario-beneficio.entity';
import { UsuarioBeneficioService } from './usuario-beneficio.service';
import { UsuarioBeneficioController } from './usuario-beneficio.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioBeneficio])],
  controllers: [UsuarioBeneficioController],
  providers: [UsuarioBeneficioService],
  exports: [UsuarioBeneficioService],
})
export class UsuarioBeneficioModule {}
