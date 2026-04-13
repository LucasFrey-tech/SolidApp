import { Module } from '@nestjs/common';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from './empresa.service';
import { Empresa } from '../../Entities/empresa.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsuarioModule } from '../user/usuario.module';
import { BeneficioModule } from '../benefit/beneficio.module';
import { EmpresaUsuario } from '../../Entities/empresa_usuario.entity';
import { HashService } from '../../common/bcryptService/hashService';
import { Usuario } from '../../Entities/usuario.entity';
import { InvitacionesModule } from '../invitaciones/invitacion.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '2h' },
    }),
    TypeOrmModule.forFeature([Empresa, EmpresaUsuario, Usuario]),
    UsuarioModule,
    BeneficioModule,
    InvitacionesModule,
  ],

  controllers: [EmpresaController],

  providers: [EmpresaService, HashService],

  exports: [EmpresaService, TypeOrmModule],
})
export class EmpresaModule {}
