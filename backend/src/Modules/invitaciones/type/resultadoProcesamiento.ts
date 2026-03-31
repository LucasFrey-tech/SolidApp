import { Invitacion } from '../../../Entities/invitacion.entity';

export type ResultadoProcesamiento =
  | { tipo: 'CORREO_EXISTENTE' }
  | { tipo: 'YA_INVITADO' }
  | { tipo: 'INVITACION'; invitacion: Invitacion };
