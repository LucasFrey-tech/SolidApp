import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import app_config from '../private/app.config.json';
import { AppConfig } from '../private/app.config.interface';

// Modulos
import { UserModule } from './Modules/usuario/usuario.module';
import { OrganizacionModule } from './Modules/organizacion/organizacion.module';
import { DonationModule } from './Modules/donacion/donacion.module';
import { EmpresaModule } from './Modules/empresa/empresa.module';
import { CampaignModule } from './Modules/campaña/campaña.module';
import { BeneficioModule } from './Modules/beneficio/beneficio.module';
import { AuthModule } from './Modules/PRUEBA REFACTOR/auth.module';
import { SettingsService } from './common/settings/settings.service';
import { RankingModule } from './Modules/ranking/ranking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => app_config as AppConfig],
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const db = configService.get('database_connection', { infer: true });

        if (!db) {
          throw new Error('Database configuration not found');
        }

        return {
          type: 'mssql',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
        };
      },
    }),

    AuthModule,
    UserModule,
    OrganizacionModule,
    DonationModule,
    EmpresaModule,
    CampaignModule,
    BeneficioModule,
    RankingModule,
  ],
  providers: [SettingsService],
})
export class AppModule {}
