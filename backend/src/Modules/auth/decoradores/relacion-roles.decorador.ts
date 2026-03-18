import { SetMetadata } from '@nestjs/common';
import { RELACION_ROLES_KEY } from '../guards/relacion-roles.guard';

export const RelacionRoles = (...roles: string[]) =>
  SetMetadata(RELACION_ROLES_KEY, roles);