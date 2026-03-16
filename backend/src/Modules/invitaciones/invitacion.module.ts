import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvitacionesService } from './invitacion.service';
import { InvitacionesController } from './invitacion.controller';
import { Invitacion } from '../../Entities/invitacion.entity';
import { Contacto } from '../../Entities/contacto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitacion,Contacto])
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