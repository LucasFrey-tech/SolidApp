import { forwardRef, Module } from '@nestjs/common';
import { OrganizacionController } from './organizacion.controller';
import { OrganizacionService } from './organizacion.service';
import { Organizacion } from '../../Entities/organizacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../Entities/user.entity';
import { Empresa } from '../../Entities/empresa.entity';
import { AuthModule } from '../PRUEBA REFACTOR/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organizacion, User, Empresa]),
    forwardRef(() => AuthModule),
  ],
  controllers: [OrganizacionController],
  providers: [OrganizacionService],
  exports: [OrganizacionService],
})
export class OrganizacionModule {}
