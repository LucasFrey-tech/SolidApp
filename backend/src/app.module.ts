import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import app_config from '../private/app.config.json';
import { AppConfig } from '../private/app.config.interface';

// Modulos
import { UserModule } from './Modules/user/usuario.module';
import { OrganizationModule } from './Modules/organization/organization.module';
import { DonationModule } from './Modules/donation/donation.module';
import { EmpresaModule } from './Modules/empresa/empresa.module';
import { CampaignModule } from './Modules/campaign/campaign.module';
import { BeneficioModule } from './Modules/benefit/beneficio.module';
import { AuthModule } from './Modules/auth/auth.module';
import { SettingsService } from './common/settings/settings.service';

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

    UserModule,
    OrganizationModule,
    DonationModule,
    EmpresaModule,
    CampaignModule,
    BeneficioModule,
    AuthModule,
  ],
  providers: [SettingsService],
})
export class AppModule {}
