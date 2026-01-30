import { Module } from '@nestjs/common';
import { EmpresaController } from './empresa.controller';
import { EmpresasService } from './empresa.service';
import { Empresa } from '../../Entities/empresa.entity';
import { Empresa_imagenes } from '../../Entities/empresa_imagenes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '2h' },
    }),
    TypeOrmModule.forFeature([Empresa, Empresa_imagenes]),
  ],
  controllers: [EmpresaController],
  providers: [EmpresasService],
  exports: [EmpresasService],
})
export class EmpresaModule {}
