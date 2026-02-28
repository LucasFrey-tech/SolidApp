import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuenta } from '../../Entities/cuenta.entity';
import { CuentaService } from './cuenta.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cuenta]), CommonModule],
  providers: [CuentaService],
  exports: [CuentaService],
})
export class CuentaModule {}
