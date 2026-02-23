import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuenta } from '../../Entities/cuenta.entity';
import { CuentaService } from './cuenta.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cuenta])],
  providers: [CuentaService],
  exports: [CuentaService],
})
export class CuentaModule {}
