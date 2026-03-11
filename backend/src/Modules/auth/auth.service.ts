import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

import { UsuarioService } from '../user/usuario.service';
import { Rol } from '../../Entities/usuario.entity';

import { LoginDto, RegisterDto } from './dto/auth.dto';

import { DataSource } from 'typeorm';
import { HashService } from '../../common/bcryptService/hashService';
import { EmailService } from '../email/email.service';

import { randomBytes } from 'crypto';
import { JwtPayload } from './dto/token_payload';
import { GestionTipo } from './dto/gestion.enum';

import { GestionDetector } from './estrategias/gestion/gestion_detector';
/**
 * Servicio que maneja la lógica de negocio para el Sistema de Autenticación
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly emailService: EmailService,
    private readonly gestionDetector: GestionDetector,
  ) {
    this.logger.log('AuthService inicializado');
  }

  private buildToken(payload: JwtPayload) {
    return {
      token: this.jwtService.sign({
        sub: payload.sub,
        email: payload.email,
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
    const existe = await this.usuarioService.findByEmail(dto.correo);

    if (existe) throw new BadRequestException('El correo ya está registrado');

    const clave = await this.hashService.hash(dto.clave);

    const usuario = await this.usuarioService.create({
      correo: dto.correo,
      clave: clave,
      nombre: dto.nombre,
      apellido: dto.apellido,
      documento: dto.documento,
      rol: Rol.USUARIO,
    });

    const tokenPayload = this.createPayload(
      usuario.id,
      usuario.contacto.correo,
      usuario.rol,
    );

    this.logger.log('DATOS DEL USUARIO REGISTRADO: ', usuario);

    return this.buildToken(tokenPayload);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarioService.findByEmailRol(
      dto.correo,
      dto.rol,
    );
    console.log('Usuario encontrada:', usuario ? 'Sí' : 'No');

    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    this.checkDeshabilitado(usuario.habilitado);

    console.log('Hash en BD:', usuario.clave);

    const claveValida = await this.hashService.compare(
      dto.clave,
      usuario.clave,
    );

    console.log('¿Contraseña válida?', claveValida);

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
      usuario.contacto.correo,
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
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await this.usuarioService.setResetToken(usuario.id, token, expires);

    await this.emailService.sendResetPasswordEmail(email, token);
    return { message: 'Email enviado' };
  }

  async resetPassword(token: string, newPassword: string) {
    const usuario = await this.usuarioService.findByResetToken(token);
    console.log(
      'Usuario encontrado:',
      usuario ? usuario.contacto.correo : 'NO',
    );

    if (!usuario) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    console.log('Nueva contraseña (texto):', newPassword);

    const hashedPassword = await this.hashService.hash(newPassword);
    console.log('Hash generado:', hashedPassword);

    await this.usuarioService.resetPassword(usuario.id, hashedPassword);
    console.log('Contraseña actualizada en BD');

    const usuarioActualizado = await this.usuarioService.findOne(usuario.id);
    console.log('Hash guardado en BD:', usuarioActualizado?.clave);

    return { message: 'Contraseña actualizada correctamente' };
  }

  createPayload(
    id: number,
    correo: string,
    rol: Rol,
    gestion?: GestionTipo | null,
    gestionId?: number | null,
  ): JwtPayload {
    return {
      sub: id,
      email: correo,
      rol: rol,
      gestion,
      gestionId,
    };
  }
}
