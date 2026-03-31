import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';

import { UsuarioService } from '../user/usuario.service';
import { Rol } from '../user/enums/enums';

import { LoginDto, RegisterDto } from './dto/auth.dto';

import { HashService } from '../../common/bcryptService/hashService';
import { EmailService } from '../email/email.service';

import { randomBytes } from 'crypto';
import { JwtPayload } from './dto/token_payload';
import { GestionTipo } from './dto/gestion.enum';
import { InvitacionesService } from '../invitaciones/invitacion.service';
import { GestionDetector } from './estrategias/gestion/gestion_detector';

import { ErrorManager } from '../../common/errors/error.manager';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly emailService: EmailService,
    private readonly gestionDetector: GestionDetector,
    private readonly invitacionesService: InvitacionesService,
  ) {
    this.logger.log('AuthService inicializado');
  }

  private buildToken(payload: JwtPayload) {
    return {
      token: this.jwtService.sign({
        sub: payload.sub,
        rol: payload.rol,
        gestion: payload.gestion,
        gestionId: payload.gestionId,
      }),
    };
  }

  async register(dto: RegisterDto) {
    try {
      if (await this.usuarioService.findByEmail(dto.correo)) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El correo ya está registrado',
        });
      }

      const clave = await this.hashService.hash(dto.clave);
      let rol = Rol.USUARIO;

      if (dto.token) {
        const invitacion = await this.invitacionesService.validarInvitacion(
          dto.token,
          dto.correo,
        );
        rol = Rol.COLABORADOR;

        const usuario = await this.usuarioService.create({
          correo: dto.correo,
          clave,
          nombre: dto.nombre,
          apellido: dto.apellido,
          documento: dto.documento,
          rol,
        });

        await Promise.all([
          invitacion.organizacionId
            ? this.invitacionesService.agregarUsuarioAOrganizacion(
                usuario.id,
                invitacion.organizacionId,
              )
            : Promise.resolve(),
          invitacion.empresaId
            ? this.invitacionesService.agregarUsuarioAEmpresa(
                usuario.id,
                invitacion.empresaId,
              )
            : Promise.resolve(),
        ]);

        await this.invitacionesService.marcarAceptada(
          invitacion.id,
          usuario.id,
        );
        return this.buildToken(this.createPayload(usuario.id, usuario.rol));
      }

      const usuario = await this.usuarioService.create({
        correo: dto.correo,
        clave,
        nombre: dto.nombre,
        apellido: dto.apellido,
        documento: dto.documento,
        rol,
      });

      return this.buildToken(this.createPayload(usuario.id, usuario.rol));
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  async login(dto: LoginDto) {
    try {
      const usuario = await this.usuarioService.findByEmail(dto.correo);

      if (!usuario) {
        throw new ErrorManager({
          type: 'UNAUTHORIZED',
          message: 'Credenciales incorrectas',
        });
      }

      if (!usuario.habilitado) {
        throw new ErrorManager({
          type: 'FORBIDDEN',
          message: 'Usuario bloqueado. Contacte al Administrador.',
        });
      }

      const claveValida = await this.hashService.compare(
        dto.clave,
        usuario.clave,
      );

      if (!claveValida) {
        throw new ErrorManager({
          type: 'UNAUTHORIZED',
          message: 'Credenciales incorrectas',
        });
      }

      await this.usuarioService.actualizarUltimaConexion(usuario.id);

      const gestionInfo =
        usuario.rol === Rol.COLABORADOR
          ? await this.gestionDetector.detectar(usuario.id)
          : null;

      return this.buildToken(
        this.createPayload(
          usuario.id,
          usuario.rol,
          gestionInfo?.tipo ?? null,
          gestionInfo?.entidadId ?? null,
        ),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }

      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  async forgotPassword(email: string) {
    try {
      const usuario = await this.usuarioService.findByEmail(email);

      if (!usuario) {
        return { message: 'Si el email existe, recibirás un enlace' };
      }

      const token = randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000);

      await this.usuarioService.setResetToken(usuario.id, token, expires);
      await this.emailService.sendResetPasswordEmail(email, token);

      return { message: 'Email enviado' };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const usuario = await this.usuarioService.findByResetToken(token);

      if (!usuario) {
        throw new ErrorManager({
          type: 'UNAUTHORIZED',
          message: `Token inválido o expirado`,
        });
      }

      const hashedPassword = await this.hashService.hash(newPassword);

      await this.usuarioService.resetPassword(usuario.id, hashedPassword);

      return { message: 'Contraseña actualizada correctamente' };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  createPayload(
    id: number,
    rol: Rol,
    gestion?: GestionTipo | null,
    gestionId?: number | null,
  ): JwtPayload {
    return {
      sub: id,
      rol: rol,
      gestion,
      gestionId,
    };
  }
}
