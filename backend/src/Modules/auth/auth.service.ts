import * as bcrypt from 'bcrypt';
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

import { RegisterDto } from './dto/auth.dto';
import { LoginDto } from './dto/auth.dto';
import { CuentaService } from '../cuenta/cuenta.service';

import { RegistroUsuarioDto } from '../user/dto/registro_usuario.dto';
import { RegistroEmpresaDto } from '../empresa/dto/registro_empresa.dto';
import { RegistroOrganizacionDto } from '../organization/dto/registro_organizacion.dto';

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
    private readonly jwtService: JwtService,
  ) {
    this.logger.log('AuthService inicializado');
  }

  private async hashPassword(clave: string): Promise<string> {
    return bcrypt.hash(clave, 10);
  }

  private async verifyPassword(clave: string, hash: string): Promise<void> {
    const coincidencia = await bcrypt.compare(clave, hash);
    if (!coincidencia) throw new UnauthorizedException('Contraseña incorrecta');
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

    const clave = await this.hashPassword(dto.clave);

    const cuenta = await this.cuentaService.create({
      correo: dto.correo,
      clave: clave,
      role: dto.role,
    });

    if (!Object.values(RolCuenta).includes(dto.role)) {
      throw new BadRequestException('Rol inválido');
    }

    try {
      switch (dto.role) {
        case RolCuenta.USUARIO:
          await this.perfilUsuarioService.create(
            dto.perfil as RegistroUsuarioDto,
            cuenta.id,
          );
          break;
        case RolCuenta.EMPRESA:
          await this.perfilEmpresaService.create(
            dto.perfil as RegistroEmpresaDto,
            cuenta.id,
          );
          break;
        case RolCuenta.ORGANIZACION:
          await this.perfilOrganizacionService.create(
            dto.perfil as RegistroOrganizacionDto,
            cuenta.id,
          );
          break;
      }
    } catch (error) {
      this.logger.error(`Error creando perfil: ${error.message}`);
      throw new BadRequestException('Error al crear el perfil');
    }

    return this.buildToken(cuenta);
  }

  async login(dto: LoginDto) {
    const cuenta = await this.cuentaService.findByEmail(dto.correo);

    if (!cuenta) throw new UnauthorizedException();

    await this.verifyPassword(dto.clave, cuenta.clave);

    this.checkDeshabilitado(cuenta.deshabilitado);

    await this.cuentaService.actualizarUltimaConexion(cuenta.id);

    return this.buildToken(cuenta);
  }
}
