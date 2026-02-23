import { Module } from '@nestjs/common';
import { EmpresaController } from './empresa.controller';
import { PerfilEmpresaService } from './empresa.service';
import { PerfilEmpresa } from '../../Entities/perfil_empresa.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CuentaModule } from '../cuenta/cuenta.module';

/**
 * ============================================================
 * EmpresaModule
 * ============================================================
 * Módulo encargado de encapsular toda la funcionalidad
 * relacionada a la gestión de Empresas dentro del sistema.
 *
 * Responsabilidades:
 * - Registrar dependencias necesarias para Empresas
 * - Configurar acceso a base de datos (TypeORM)
 * - Configurar JWT para autenticación
 * - Vincular Controller + Service
 *
 * Arquitectura:
 * - Sigue el patrón modular de NestJS
 * - Utiliza inyección de dependencias
 * - Exporta el servicio para ser utilizado en otros módulos
 *
 * Componentes registrados:
 * - EmpresaController → Manejo de endpoints HTTP
 * - EmpresasService → Lógica de negocio
 *
 * Entidades asociadas:
 * - Empresa
 * - Empresa_imagenes
 *
 * Seguridad:
 * - Configuración de JwtModule con expiración de 2 horas
 * - Uso de secret definido por variable de entorno
 * ============================================================
 */
@Module({
  imports: [
    /**
     * Configuración del módulo JWT.
     *
     * - secret: clave secreta para firmar tokens.
     * - expiresIn: tiempo de expiración del token.
     *
     * Nota:
     * En producción debe utilizarse exclusivamente
     * process.env.JWT_SECRET.
     */
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '2h' },
    }),

    /**
     * Registro de entidades para inyección
     * de repositorios TypeORM en el servicio.
     *
     * Permite usar:
     * @InjectRepository(Empresa)
     */
    TypeOrmModule.forFeature([PerfilEmpresa]),
    CuentaModule,
  ],

  /**
   * Controladores asociados al módulo.
   * Manejan las rutas HTTP relacionadas a Empresas.
   */
  controllers: [EmpresaController],

  /**
   * Servicios que contienen la lógica de negocio.
   */
  providers: [PerfilEmpresaService],

  /**
   * Exporta el servicio para que pueda ser
   * utilizado en otros módulos del sistema.
   */
  exports: [PerfilEmpresaService],
})
export class EmpresaModule {}
