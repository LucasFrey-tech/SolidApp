import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decoradores/roles.decorador';
import { PUBLIC_KEY } from '../decoradores/auth.decorador';
import { Rol } from '../../../Entities/usuario.entity';
import { UsuarioAutenticado } from '../interfaces/authenticated_request.interface';
import { Request } from 'express';

interface RequestConUsuario extends Request {
  user: UsuarioAutenticado;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestConUsuario>();

    const usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const tieneRol = requiredRoles.includes(usuario.rol);

    if (!tieneRol) {
      throw new ForbiddenException(
        `Se requiere rol: ${requiredRoles.join(' o ')}`,
      );
    }

    return true;
  }
}
