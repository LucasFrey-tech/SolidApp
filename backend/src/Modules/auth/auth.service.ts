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

import { LoginDto, RegisterDto } from './dto/auth.dto';
import { CuentaService } from '../cuenta/cuenta.service';

import { DataSource } from 'typeorm';
import { RegisterAdminDto } from './dto/register_admin.dto';

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
    private dataSource: DataSource,
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
      clave: await this.hashPassword(dto.clave),
      role: RolCuenta.ADMIN,
    });

    return this.buildToken(cuenta);
  }

  async login(dto: LoginDto) {
    const cuenta = await this.cuentaService.findByEmail(dto.correo);

    if (!cuenta) throw new UnauthorizedException('Credenciales incorrectas');

    this.checkDeshabilitado(cuenta.deshabilitado);

    await this.verifyPassword(dto.clave, cuenta.clave);

    await this.cuentaService.actualizarUltimaConexion(cuenta.id);

    return this.buildToken(cuenta);
  }
}
