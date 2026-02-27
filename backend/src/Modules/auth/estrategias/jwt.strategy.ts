import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { CuentaService } from '../../cuenta/cuenta.service';
import { PerfilUsuarioService } from '../../user/usuario.service';
import { PerfilEmpresaService } from '../../empresa/empresa.service';
import { PerfilOrganizacionService } from '../../organization/organizacion.service';
import { RolCuenta } from '../../../Entities/cuenta.entity';
import {
  PerfilAsociado,
  UsuarioAutenticado,
} from '../interfaces/authenticated_request.interface';

interface JwtPayload {
  sub: number;
  email: string;
  role: RolCuenta;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly cuentaService: CuentaService,
    private readonly perfilUsuarioService: PerfilUsuarioService,
    private readonly perfilEmpresaService: PerfilEmpresaService,
    private readonly perfilOrganizacionService: PerfilOrganizacionService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error(
        'JWT_SECRET no está definido en las variables de entorno',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    this.logger.log('JwtStrategy inicializada');
  }

  async validate(payload: JwtPayload): Promise<UsuarioAutenticado> {
    console.log('🔍 JwtStrategy.validate() - PAYLOAD RECIBIDO:', payload);
    this.logger.debug(
      `Validando token para ${payload.email} (${payload.role})`,
    );

    try {
      const cuenta = await this.cuentaService.findById(payload.sub);

      if (!cuenta) {
        throw new UnauthorizedException('Cuenta no encontrada');
      }

      if (cuenta.deshabilitado) {
        throw new UnauthorizedException('Cuenta deshabilitada');
      }

      let perfil: PerfilAsociado;

      switch (cuenta.role) {
        case RolCuenta.USUARIO:
          perfil = await this.perfilUsuarioService.findByCuentaId(cuenta.id);
          break;
        case RolCuenta.EMPRESA:
          perfil = await this.perfilEmpresaService.findByCuentaId(cuenta.id);
          break;
        case RolCuenta.ORGANIZACION:
          perfil = await this.perfilOrganizacionService.findByCuentaId(
            cuenta.id,
          );
          break;
        case RolCuenta.ADMIN:
          perfil = cuenta;
          break;
        default:
          throw new UnauthorizedException('Rol inválido');
      }

      if (!perfil) {
        throw new UnauthorizedException('Perfil no encontrado');
      }

      this.cuentaService
        .actualizarUltimaConexion(cuenta.id)
        .catch((error: Error) => {
          this.logger.error(
            `Error actualizando última conexión: ${error.message}`,
          );
        });

      return { cuenta, perfil };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error validando token: ${error.message}`);
      } else {
        this.logger.error('Error desconocido validando token');
      }
      throw new UnauthorizedException('Token inválido');
    }
  }
}
