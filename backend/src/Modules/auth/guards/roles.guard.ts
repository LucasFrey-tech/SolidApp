import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decoradores/roles.decorador';
import { RolCuenta } from '../../../Entities/cuenta.entity';
import { UsuarioAutenticado } from '../interfaces/authenticated_request.interface';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: UsuarioAutenticado;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolCuenta[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !user.cuenta) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const tieneRol = requiredRoles.includes(user.cuenta.role);

    if (!tieneRol) {
      throw new ForbiddenException(
        `Se requiere rol: ${requiredRoles.join(' o ')}`,
      );
    }

    return true;
  }
}
