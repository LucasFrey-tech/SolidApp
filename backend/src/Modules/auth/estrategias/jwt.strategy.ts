import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { UsuarioService } from '../../user/usuario.service';
//import { EmpresaService } from '../../empresa/empresa.service';
//import { OrganizacionService } from '../../organization/organizacion.service';
//import { Rol } from '../../../Entities/usuario.entity';
import { UsuarioAutenticado } from '../interfaces/authenticated_request.interface';
import { JwtPayload } from '../dto/token_payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usuarioService: UsuarioService,
    //private readonly empresaService: EmpresaService,
    //private readonly organizacionService: OrganizacionService,
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
    this.logger.debug(`Validando token para ${payload.email} (${payload.rol})`);

    try {
      const usuario = await this.usuarioService.findOne(payload.sub);

      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrada');
      }

      if (!usuario.habilitado) {
        throw new UnauthorizedException('Usuario deshabilitado');
      }

      this.usuarioService
        .actualizarUltimaConexion(usuario.id)
        .catch((error: Error) => {
          this.logger.error(
            `Error actualizando última conexión: ${error.message}`,
          );
        });

      return usuario;
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
