
import { Rol } from '../../user/enums/enums';
import { GestionTipo } from './gestion.enum';

export interface JwtPayload {
  sub: number;
  rol: Rol;
  gestion?: GestionTipo | null;
  gestionId?: number | null;
}
