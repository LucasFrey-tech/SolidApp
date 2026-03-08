import { Rol } from '../../../Entities/usuario.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: Rol;
}
