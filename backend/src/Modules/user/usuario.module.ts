import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../../Entities/usuario.entity';
import { CommonMulterModule } from '../../common/multer/multer.module';
import { DonacionModule } from '../donation/donacion.module';
import { BeneficioModule } from '../benefit/beneficio.module';
import { UsuarioBeneficioModule } from './usuario-beneficio/usuario-beneficio.module';
import { HashService } from '../../common/bcryptService/hashService';
import { InvitacionesModule } from '../invitaciones/invitacion.module';

/**
 * -----------------------------------------------------------------------------
 * UserModule
 * -----------------------------------------------------------------------------
 * Módulo encargado de la gestión completa de usuarios.
 *
 * Responsabilidades:
 * - Registro y administración de usuarios
 * - Actualización de credenciales
 * - Generación de JWT cuando se modifican datos sensibles
 * - Manejo de subida de imágenes (perfil)
 *
 * Importa:
 * - TypeOrmModule → Para inyectar el repositorio de Usuario
 * - JwtModule → Para firmar tokens JWT
 * - CommonMulterModule → Para manejo de uploads
 *
 * Exporta:
 * - UsuarioService → Para que pueda ser utilizado en otros módulos
 * -----------------------------------------------------------------------------
 */
@Module({
  imports: [
    /**
     * Registro del módulo JWT.
     * Se utiliza para firmar tokens cuando:
     * - El usuario actualiza su email
     * - El usuario cambia su contraseña
     */
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '2h' }, // Token válido por 2 horas
    }),

    /**
     * Registro de la entidad Usuario para poder
     * inyectar Repository<Usuario> en el servicio.
     */
    TypeOrmModule.forFeature([Usuario]),

    DonacionModule,
    BeneficioModule,
    UsuarioBeneficioModule,
    

    /**
     * Módulo personalizado para manejo de archivos
     * (por ejemplo imagen de perfil).
     */
    CommonMulterModule,
    InvitacionesModule,
  ],

  /**
   * Controladores del módulo
   */
  controllers: [UsuarioController],

  /**
   * Servicios que pertenecen a este módulo
   */
  providers: [UsuarioService, HashService],

  /**
   * Exportamos el servicio para que pueda ser usado
   * en otros módulos (ej: AuthModule).
   */
  exports: [UsuarioService],
})
export class UsuarioModule {}
