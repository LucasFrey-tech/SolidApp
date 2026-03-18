import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

import { UsuarioService } from '../user/usuario.service';
import { Rol }  from '../user/enums/enums';

import { LoginDto, RegisterDto } from './dto/auth.dto';

import { HashService } from '../../common/bcryptService/hashService';
import { EmailService } from '../email/email.service';

import { randomBytes } from 'crypto';
import { JwtPayload } from './dto/token_payload';
import { GestionTipo } from './dto/gestion.enum';
import { InvitacionesService } from '../invitaciones/invitacion.service';
import { GestionDetector } from './estrategias/gestion/gestion_detector';

import { ResponseUsuarioDto } from '../user/dto/response_usuario.dto';

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

  private checkDeshabilitado(habilitado: boolean): void {
    if (!habilitado)
      throw new ForbiddenException(
        'Usuario bloqueado. Contacte al administrador.',
      );
  }

  async register(dto: RegisterDto) {
  // Verificar si el correo ya existe
  if (await this.usuarioService.findByEmail(dto.correo)) {
    throw new BadRequestException('El correo ya está registrado');
  }

  const clave = await this.hashService.hash(dto.clave);

  let usuario: ResponseUsuarioDto;

  if (dto.token) {
    // Buscar invitación
    const invitacion = await this.invitacionesService.buscarPorToken(dto.token);
    if (!invitacion) throw new BadRequestException('Invitación inválida');
    if (invitacion.correo !== dto.correo) {
      throw new BadRequestException('El correo no coincide con la invitación');
    }

    // Crear usuario con rol GESTOR
    usuario = await this.usuarioService.create({
      correo: dto.correo,
      clave,
      nombre: dto.nombre,
      apellido: dto.apellido,
      documento: dto.documento,
      rol: Rol.GESTOR,
    });

    // Agregar usuario a empresa/organización si existen
    await Promise.all([
      invitacion.organizacionId
        ? this.invitacionesService.agregarUsuarioAOrganizacion(usuario.id, invitacion.organizacionId)
        : Promise.resolve(),
      invitacion.empresaId
        ? this.invitacionesService.agregarUsuarioAEmpresa(usuario.id, invitacion.empresaId)
        : Promise.resolve(),
    ]);

    await this.invitacionesService.marcarAceptada(invitacion.id);

  } else {
    // Crear usuario sin invitación (rol normal)
    usuario = await this.usuarioService.create({
      correo: dto.correo,
      clave,
      nombre: dto.nombre,
      apellido: dto.apellido,
      documento: dto.documento,
      rol: Rol.USUARIO,
    });

    const tokenPayload = this.createPayload(usuario.id, usuario.rol);

    this.logger.log('DATOS DEL USUARIO REGISTRADO: ', usuario);

    return this.buildToken(tokenPayload);
  }

  const tokenPayload = this.createPayload(usuario.id, usuario.rol);
  this.logger.log('DATOS DEL USUARIO REGISTRADO: ', usuario);

  return this.buildToken(tokenPayload);
}

  async login(dto: LoginDto) {
    const usuario = await this.usuarioService.findByEmail(dto.correo);

    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    this.checkDeshabilitado(usuario.habilitado);

    const claveValida = await this.hashService.compare(
      dto.clave,
      usuario.clave,
    );

    if (!claveValida)
      throw new UnauthorizedException('Credenciales incorrectas');

    await this.usuarioService.actualizarUltimaConexion(usuario.id);

    let gestion: GestionTipo | null = null;
    let gestionId: number | null = null;

    if (usuario.rol === Rol.GESTOR) {
      const gestionInfo = await this.gestionDetector.detectar(usuario.id);

      gestion = gestionInfo?.tipo ?? null;
      gestionId = gestionInfo?.entidadId ?? null;
    }

    const tokenPayload = this.createPayload(
      usuario.id,
      usuario.rol,
      gestion,
      gestionId,
    );

    return this.buildToken(tokenPayload);
  }

  async forgotPassword(email: string) {
    const usuario = await this.usuarioService.findByEmail(email);

    if (!usuario) {
      return { message: 'Si el email existe, recibirás un enlace' };
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);

    await this.usuarioService.setResetToken(usuario.id, token, expires);

    await this.emailService.sendResetPasswordEmail(email, token);

    return { message: 'Email enviado' };
  }

  async resetPassword(token: string, newPassword: string) {
    const usuario = await this.usuarioService.findByResetToken(token);

    if (!usuario) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const hashedPassword = await this.hashService.hash(newPassword);

    await this.usuarioService.resetPassword(
      usuario.id,
      hashedPassword,
    );

    return { message: 'Contraseña actualizada correctamente' };
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