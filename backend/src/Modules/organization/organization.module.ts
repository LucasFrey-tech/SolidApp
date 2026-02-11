import { Module } from '@nestjs/common';
import { OrganizationsController } from './organization.controller';
import { OrganizationsService } from './organization.service';
import { Organizations } from '../../Entities/organizations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Campaigns } from '../../Entities/campaigns.entity';
import { CampaignModule } from '../campaign/campaign.module';

/**
 * OrganizationModule
 * -------------------
 * Módulo encargado de la gestión de organizaciones dentro del sistema.
 *
 * Responsabilidades:
 * - Registro de organizaciones.
 * - Actualización de datos y credenciales.
 * - Paginación y búsqueda.
 * - Gestión de estado (habilitar/deshabilitar).
 * - Obtención de campañas asociadas.
 *
 * Dependencias:
 * - TypeORM (repositorio Organizations y Campaigns).
 * - JwtModule (para generación de tokens).
 * - CampaignModule (para consultas de campañas asociadas).
 */
@Module({
  imports: [
    /**
     * Registro del módulo JWT.
     *
     * Se utiliza para:
     * - Firmar tokens al actualizar credenciales.
     * - Manejar autenticación basada en JWT.
     *
     * Configuración:
     * - secret: variable de entorno JWT_SECRET.
     * - expiresIn: 2 horas.
     */
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '2h' },
    }),

    /**
     * Registro de repositorios para inyección con @InjectRepository().
     *
     * Entidades registradas:
     * - Organizations
     * - Campaigns
     */
    TypeOrmModule.forFeature([Organizations, Campaigns]),

    /**
     * Importación del módulo de campañas.
     *
     * Permite:
     * - Acceder a CampaignsService.
     * - Obtener campañas asociadas a una organización.
     */
    CampaignModule,
  ],

  /**
   * Controladores que manejan las rutas HTTP
   * relacionadas a organizaciones.
   */
  controllers: [OrganizationsController],

  /**
   * Providers disponibles dentro del módulo.
   */
  providers: [OrganizationsService],

  /**
   * Exporta el servicio para que pueda ser
   * utilizado en otros módulos si es necesario.
   */
  exports: [OrganizationsService],
})
export class OrganizationModule {}
