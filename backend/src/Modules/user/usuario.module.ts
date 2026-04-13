import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../../Entities/usuario.entity';
import { CommonMulterModule } from '../../common/multer/multer.module';
import { DonacionModule } from '../donation/donacion.module';
import { BeneficioModule } from '../benefit/beneficio.module';
import { UsuarioBeneficioModule } from './usuario-beneficio/usuario-beneficio.module';
import { HashService } from '../../common/bcryptService/hashService';
import { InvitacionesModule } from '../invitaciones/invitacion.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '2h' }, // Token válido por 2 horas
    }),

    TypeOrmModule.forFeature([Usuario]),

    DonacionModule,
    BeneficioModule,
    UsuarioBeneficioModule,

    CommonMulterModule,
    InvitacionesModule,
  ],

  controllers: [UsuarioController],

  providers: [UsuarioService, HashService],

  exports: [UsuarioService],
})
export class UsuarioModule {}
