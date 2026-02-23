// /backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/usuario.module';
import { EmpresaModule } from '../empresa/empresa.module';
import { OrganizationModule } from '../organization/organizacion.module';
import { CommonMulterModule } from '../../common/multer/multer.module';
import { Cuenta } from '../../Entities/cuenta.entity';
import { CuentaService } from '../cuenta/cuenta.service';
import { JwtStrategy } from './estrategias/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

/**
 * Módulo de NestJS que agrupa los componentes relacionados a la Autenticación:
 * - Controlador
 * - Servicio
 * - Repositorios TypeORM
 */
@Module({
  imports: [
    UserModule,
    EmpresaModule,
    OrganizationModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([Cuenta]),
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
  providers: [AuthService, CuentaService, JwtStrategy, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
