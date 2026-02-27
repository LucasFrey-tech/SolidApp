import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

import { PerfilUsuarioService } from '../user/usuario.service';
import { PerfilEmpresaService } from '../empresa/empresa.service';
import { PerfilOrganizacionService } from '../organization/organizacion.service';
import { Cuenta, RolCuenta } from '../../Entities/cuenta.entity';

import { LoginDto, RegisterDto } from './dto/auth.dto';
import { CuentaService } from '../cuenta/cuenta.service';

import { DataSource } from 'typeorm';
import { RegisterAdminDto } from './dto/register_admin.dto';
import { HashService } from '../../common/bcryptService/hashService';
import { EmailService } from '../email/email.service';

import { randomBytes } from 'crypto';
/**
 * Servicio que maneja la lógica de negocio para el Sistema de Autenticación
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly cuentaService: CuentaService,
    private readonly perfilUsuarioService: PerfilUsuarioService,
    private readonly perfilEmpresaService: PerfilEmpresaService,
    private readonly perfilOrganizacionService: PerfilOrganizacionService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly emailService: EmailService,
  ) {
    this.logger.log('AuthService inicializado');
  }

  private buildToken(cuenta: Cuenta) {
    return {
      token: this.jwtService.sign({
        sub: cuenta.id,
        email: cuenta.correo,
        role: cuenta.role,
      }),
    };
  }

  private checkDeshabilitado(deshabilitado: boolean): void {
    if (deshabilitado)
      throw new ForbiddenException(
        'Usuario bloqueado. Contacto al administrador.',
      );
  }

  async register(dto: RegisterDto) {
    const existe = await this.cuentaService.findByEmail(dto.correo);

    if (existe) throw new BadRequestException('El correo ya está registrado');

    if (!Object.values(RolCuenta).includes(dto.role)) {
      throw new BadRequestException('Rol inválido');
    }

    const clave = await this.hashService.hash(dto.clave);

    return this.dataSource.transaction(async (manager) => {
      const cuenta = await this.cuentaService.create(
        {
          correo: dto.correo,
          clave,
          role: dto.role,
        },
        manager,
      );

      switch (dto.role) {
        case RolCuenta.USUARIO:
          if (!dto.perfilUsuario)
            throw new BadRequestException('Faltan datos del perfil');
          await this.perfilUsuarioService.create(
            dto.perfilUsuario,
            cuenta.id,
            manager,
          );
          break;
        case RolCuenta.EMPRESA:
          if (!dto.perfilEmpresa)
            throw new BadRequestException('Faltan datos del perfil');
          await this.perfilEmpresaService.create(
            dto.perfilEmpresa,
            cuenta.id,
            manager,
          );
          break;
        case RolCuenta.ORGANIZACION:
          if (!dto.perfilOrganizacion)
            throw new BadRequestException('Faltan datos del perfil');
          await this.perfilOrganizacionService.create(
            dto.perfilOrganizacion,
            cuenta.id,
            manager,
          );
          break;
      }

      return this.buildToken(cuenta);
    });
  }

  async registerAdmin(dto: RegisterAdminDto) {
    const cuenta = await this.cuentaService.create({
      correo: dto.correo,
      clave: await this.hashService.hash(dto.clave),
      role: RolCuenta.ADMIN,
    });

    return this.buildToken(cuenta);
  }

  async login(dto: LoginDto) {
    console.log('=== INTENTO DE LOGIN ===');
    console.log('Email:', dto.correo);
    console.log('Contraseña ingresada:', dto.clave);

    const cuenta = await this.cuentaService.findByEmailRol(dto.correo, dto.rol);
    console.log('Cuenta encontrada:', cuenta ? 'Sí' : 'No');

    if (!cuenta) throw new UnauthorizedException('Credenciales incorrectas');

    if (cuenta.deshabilitado) {
      throw new UnauthorizedException('Cuenta deshabilitada');
    }

    console.log('Hash en BD:', cuenta.clave);

    const claveValida = await this.hashService.compare(dto.clave, cuenta.clave);
    console.log('¿Contraseña válida?', claveValida);
    if (!claveValida)
      throw new UnauthorizedException('Credenciales incorrectas');

    await this.cuentaService.actualizarUltimaConexion(cuenta.id);

    return this.buildToken(cuenta);
  }

  async forgotPassword(email: string) {
    const user = await this.cuentaService.findByEmail(email);
    if (!user) {
      return { message: 'Si el email existe, recibirás un enlace' };
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await this.cuentaService.setResetToken(user.id, token, expires);

    await this.emailService.sendResetPasswordEmail(email, token);
    return { message: 'Email enviado' };
  }

  async resetPassword(token: string, newPassword: string) {
    console.log('=== RESET PASSWORD ===');
    console.log('Token recibido:', token);

    const user = await this.cuentaService.findByResetToken(token);
    console.log('Usuario encontrado:', user ? user.correo : 'NO');

    if (!user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    console.log('Nueva contraseña (texto):', newPassword);

    const hashedPassword = await this.hashService.hash(newPassword);
    console.log('Hash generado:', hashedPassword);

    await this.cuentaService.resetPassword(user.id, hashedPassword);
    console.log('Contraseña actualizada en BD');

    // Verificar que se guardó
    const updatedUser = await this.cuentaService.findById(user.id);
    console.log('Hash guardado en BD:', updatedUser?.clave);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
