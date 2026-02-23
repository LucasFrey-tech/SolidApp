import { SetMetadata } from '@nestjs/common';
import { RolCuenta } from '../../../Entities/cuenta.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolCuenta[]) => SetMetadata(ROLES_KEY, roles);
