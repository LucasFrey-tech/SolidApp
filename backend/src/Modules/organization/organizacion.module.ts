import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizacion.controller';
import { PerfilOrganizacionService } from './organizacion.service';
import { PerfilOrganizacion } from '../../Entities/perfil_organizacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Campaigns } from '../../Entities/campaigns.entity';
import { CampaignModule } from '../campaign/campaign.module';
import { DonationModule } from '../donation/donacion.module';
import { CuentaModule } from '../cuenta/cuenta.module';

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
    TypeOrmModule.forFeature([PerfilOrganizacion, Campaigns]),

    /**
     * Importación del módulo de campañas.
     *
     * Permite:
     * - Acceder a CampaignsService.
     * - Obtener campañas asociadas a una organización.
     */
    CampaignModule,
    DonationModule,
    CuentaModule,
  ],

  /**
   * Controladores que manejan las rutas HTTP
   * relacionadas a organizaciones.
   */
  controllers: [OrganizationsController],

  /**
   * Providers disponibles dentro del módulo.
   */
  providers: [PerfilOrganizacionService],

  /**
   * Exporta el servicio para que pueda ser
   * utilizado en otros módulos si es necesario.
   */
  exports: [PerfilOrganizacionService],
})
export class OrganizationModule {}
