import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RelacionGuard } from '../guards/relacion.guard';
import { RelacionRolesGuard } from '../guards/relacion-roles.guard';
import { RelacionRoles } from './relacion-roles.decorador';

export function AuthRelacion(...roles: ('MIEMBRO' | 'GESTOR')[]) {
  return applyDecorators(
    UseGuards(AuthGuard('jwt'), RelacionGuard, RelacionRolesGuard),
    RelacionRoles(...roles),
  );
}
