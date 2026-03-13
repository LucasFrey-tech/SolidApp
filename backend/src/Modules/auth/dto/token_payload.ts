import { Rol } from '../../../Entities/usuario.entity';
import { GestionTipo } from './gestion.enum';

export interface JwtPayload {
  sub: number;
  rol: Rol;
  gestion?: GestionTipo | null;
  gestionId?: number | null;
}
