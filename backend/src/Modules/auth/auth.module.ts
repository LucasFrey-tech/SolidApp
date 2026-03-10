import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioModule } from '../user/usuario.module';
import { EmpresaModule } from '../empresa/empresa.module';
import { OrganizacionModule } from '../organizacion/organizacion.module';
import { CommonMulterModule } from '../../common/multer/multer.module';
import { Usuario } from '../../Entities/usuario.entity';
import { UsuarioService } from '../user/usuario.service';
import { JwtStrategy } from './estrategias/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { CommonModule } from '../../common/common.module';
import { EmailService } from '../email/email.service';
import { DonacionModule } from '../donation/donacion.module';
import { BeneficioModule } from '../benefit/beneficio.module';
import { UsuarioBeneficioModule } from '../user/usuario-beneficio/usuario-beneficio.module';

/**
 * Módulo de NestJS que agrupa los componentes relacionados a la Autenticación:
 * - Controlador
 * - Servicio
 * - Repositorios TypeORM
 */
@Module({
  imports: [
    CommonModule,
    UsuarioModule,
    EmpresaModule,
    OrganizacionModule,
    DonacionModule,
    BeneficioModule,
    UsuarioBeneficioModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([Usuario]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2h' },
      }),
    }),
    CommonMulterModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsuarioService,
    JwtStrategy,
    RolesGuard,
    EmailService,
  ],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
