import { Module } from '@nestjs/common';
import { OrganizacionesController } from './organizacion.controller';
import { OrganizacionService } from './organizacion.service';
import { Organizacion } from '../../Entities/organizacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Campaigns } from '../../Entities/campaigns.entity';
import { CampaignModule } from '../campaign/campaign.module';
import { DonacionModule } from '../donation/donacion.module';
import { UsuarioModule } from '../user/usuario.module';
import { OrganizacionUsuario } from '../../Entities/organizacion_usuario.entity';
import { Usuario } from '../../Entities/usuario.entity';
import { HashService } from '../../common/bcryptService/hashService';
import {
  UpdateContactoOrganizacionDto,
  UpdateDireccionOrganizacionDto,
} from './dto/update_organizacion.dto';
import { InvitacionesModule } from '../invitaciones/invitacion.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '2h' },
    }),

    TypeOrmModule.forFeature([
      Organizacion,
      Campaigns,
      OrganizacionUsuario,
      Usuario,
      UpdateDireccionOrganizacionDto,
      UpdateContactoOrganizacionDto,
    ]),

    UsuarioModule,
    CampaignModule,
    DonacionModule,
    InvitacionesModule,
  ],

  controllers: [OrganizacionesController],

  providers: [OrganizacionService, HashService],

  exports: [OrganizacionService, TypeOrmModule],
})
export class OrganizacionModule {}
