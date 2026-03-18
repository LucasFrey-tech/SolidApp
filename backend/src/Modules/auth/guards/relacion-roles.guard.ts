import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const RELACION_ROLES_KEY = 'relacion_roles';

interface RequestConRelacion extends Request {
  relacion?: {
  rol: string;
  tipo: 'empresa' | 'organizacion';
  entidadId: number;
  };
}

@Injectable()
export class RelacionRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      RELACION_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestConRelacion>();

    const relacion = request.relacion;

    if (!relacion) {
      throw new ForbiddenException('No hay relación cargada');
    }

    if (!requiredRoles.includes(relacion.rol)) {
      throw new ForbiddenException(
        `Se requiere rol en relación: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}