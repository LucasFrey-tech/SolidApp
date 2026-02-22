import * as express from 'express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { Log } from './logger/logger';
import { AppConfig } from '../private/app.config.interface';
import { existsSync, mkdirSync } from 'fs';
import { SettingsService } from './common/settings/settings.service';

async function bootstrap() {
  /**
   * Logger principal (Winston)
   */
  const logger = Log.getLogger();

  // Setup users image directory
  if (!existsSync(SettingsService.getStaticResourcesPath())) {
    mkdirSync(SettingsService.getStaticResourcesPath());
    console.log('PREFIX:', SettingsService.getStaticResourcesPrefix());
    console.log('PATH:', SettingsService.getStaticResourcesPath());
  }

  /**
   * Creación de la app NestJS
   */
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: logger,
    }),
  });

  app.use(
    SettingsService.getStaticResourcesPrefix(),
    express.static(SettingsService.getStaticResourcesPath()),
  );

  /**
   * Acceso a configuración tipada
   */
  const configService = app.get<ConfigService<AppConfig>>(ConfigService);
  const frontUrl = configService.get('front_url', { infer: true });
  const host = configService.get('host', { infer: true });

  if (!frontUrl || !host) {
    throw new Error('Missing required configuration values');
  }

  /**
   * Pipes globales
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * Swagger
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API SolidApp')
    .setDescription('API principal del sistema SolidApp')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  /**
   * CORS
   */
  app.enableCors({
    origin: 'http://localhost:3000', // Url Front
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization', // Encabezados de solicitud permitidos
  });

  /**
   * Inicio del servidor
   */
  await app.listen(host.port);

  logger.info(
    `
    Servidor backend iniciado en http://localhost:${host.port}`,
    { context: 'Bootstrap' },
  );
}
void bootstrap();
