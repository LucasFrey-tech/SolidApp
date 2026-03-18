import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvitacionesService } from './invitacion.service';
import { InvitacionesController } from './invitacion.controller';
import { Invitacion } from '../../Entities/invitacion.entity';
import { Contacto } from '../../Entities/contacto.entity';
import { EmpresaUsuario } from '../../Entities/empresa_usuario.entity';
import { OrganizacionUsuario } from '../../Entities/organizacion_usuario.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invitacion,
      Contacto,
      EmpresaUsuario,
      OrganizacionUsuario,
    ]),
    EmailModule,
  ],
  controllers: [
    InvitacionesController
  ],
  providers: [
    InvitacionesService
  ],
  exports: [
    InvitacionesService
  ]
})
export class InvitacionesModule {}