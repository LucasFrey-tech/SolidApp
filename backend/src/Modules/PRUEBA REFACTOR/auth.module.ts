import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { User } from '../../Entities/user.entity';
import { Usuario } from '../../Entities/usuario.entity';
import { UserModule } from '../usuario/usuario.module';
import { Empresa } from '../../Entities/empresa.entity';
import { EmpresaModule } from '../empresa/empresa.module';
import { Organizacion } from '../../Entities/organizacion.entity';
import { OrganizacionModule } from '../organizacion/organizacion.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegistrationFactory } from './registro.factory';
import { UsuarioRegistrationStrategy } from './usuario_registro.strategy';
import { EmpresaRegistrationStrategy } from './empresa_registro.strategy';
import { OrganizacionRegistrationStrategy } from './organizacion_registro.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([User, Usuario, Empresa, Organizacion]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2h' },
      }),
    }),
    forwardRef(() => UserModule),
    forwardRef(() => EmpresaModule),
    forwardRef(() => OrganizacionModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RegistrationFactory,
    UsuarioRegistrationStrategy,
    EmpresaRegistrationStrategy,
    OrganizacionRegistrationStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
