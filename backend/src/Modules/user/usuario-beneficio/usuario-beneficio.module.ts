import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioBeneficio } from '../../../Entities/usuario-beneficio.entity';
import { UsuarioBeneficioService } from './usuario-beneficio.service';

/**
 * =============================================================================
 * UsuarioBeneficioModule
 * =============================================================================
 * Módulo encargado de gestionar la lógica relacionada a los beneficios
 * (cupones) asociados a los usuarios.
 *
 * Responsabilidades:
 *  - Registrar la entidad UsuarioBeneficio en TypeORM
 *  - Proveer el UsuarioBeneficioService
 *  - Exponer el UsuarioBeneficioController
 *  - Exportar el servicio para ser utilizado en otros módulos
 *
 * Importaciones:
 *  - TypeOrmModule.forFeature([UsuarioBeneficio])
 *
 * Exportaciones:
 *  - UsuarioBeneficioService
 *
 * Este módulo permite:
 *  - Reclamar beneficios
 *  - Usar cupones
 *  - Consultar beneficios de un usuario
 * =============================================================================
 */
@Module({
  imports: [
    /**
     * Registra la entidad UsuarioBeneficio en el contexto
     * del módulo para poder inyectar el Repository<UsuarioBeneficio>.
     */
    TypeOrmModule.forFeature([UsuarioBeneficio]),
  ],

  /**
   * Servicios que contienen la lógica de negocio.
   */
  providers: [UsuarioBeneficioService],

  /**
   * Exporta el servicio para que otros módulos puedan
   * inyectarlo si lo necesitan.
   */
  exports: [UsuarioBeneficioService],
})
export class UsuarioBeneficioModule {}
