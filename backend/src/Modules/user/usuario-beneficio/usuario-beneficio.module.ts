import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioBeneficio } from '../../../Entities/usuario-beneficio.entity';
import { UsuarioBeneficioService } from './usuario-beneficio.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioBeneficio])],

  providers: [UsuarioBeneficioService],

  exports: [UsuarioBeneficioService],
})
export class UsuarioBeneficioModule {}
