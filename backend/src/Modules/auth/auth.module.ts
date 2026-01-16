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
import { OrganizationModule } from '../organization/organization.module';
import { Empresa_usuarios } from '../../Entities/empresa_usuarios.entity';
import { Organizations_user } from '../../Entities/organization_user.entity';
import { Empresa } from '../../Entities/empresa.entity';
import { Organizations } from '../../Entities/organizations.entity';

@Module({
  imports: [
    UserModule,
    EmpresaModule,
    OrganizationModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      Empresa_usuarios,
      Organizations_user,
      Empresa,
      Organizations,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
