import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles, ROLES_KEY } from './roles.decorador';
import { RolCuenta } from '../../../Entities/cuenta.entity';

export const PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(PUBLIC_KEY, true);

export function Auth(...roles: RolCuenta[]) {
  return applyDecorators(
    UseGuards(AuthGuard('jwt'), RolesGuard),
    roles.length > 0 ? Roles(...roles) : SetMetadata(ROLES_KEY, []),
  );
}
