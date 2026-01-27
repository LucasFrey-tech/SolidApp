import { forwardRef, Module } from '@nestjs/common';
import { EmpresaController } from './empresa.controller';
import { EmpresasService } from './empresa.service';
import { Empresa } from '../../Entities/empresa.entity';
import { Empresa_imagenes } from '../../Entities/empresa_imagenes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../Entities/user.entity';
import { Organizacion } from '../../Entities/organizacion.entity';
import { AuthModule } from '../PRUEBA REFACTOR/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa, Empresa_imagenes, User, Organizacion]),
    forwardRef(() => AuthModule),
  ],
  controllers: [EmpresaController],
  providers: [EmpresasService],
  exports: [EmpresasService],
})
export class EmpresaModule {}
