import { Usuario } from '../../../Entities/usuario.entity';

export type UsuarioAutenticado = Usuario;

// Extensión de la interfaz Request de Express
export type RequestConUsuario = Request & {
  user: UsuarioAutenticado;
  relacion?: {
    rol: string;
    tipo: 'empresa' | 'organizacion';
    entidadId: number;
  };
};
