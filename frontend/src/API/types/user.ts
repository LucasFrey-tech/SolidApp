import { Rol } from "./auth";
import { GestionTipo } from "./gestion/enum";

export interface User {
  id: number;
  email: string;
  username: string;
  documento: string;
  rol: Rol;
  nombre: string;
  apellido: string;
  habilitado: boolean;

  direccion?: {
    calle?: string;
    numero?: string;
    adicional?: string;
    codigo_postal?: string;
    provincia?: string;
    ciudad?: string;
  };

  contacto?: {
    prefijo?: string;
    telefono?: string;
    correo?: string;
  };

  gestion?: GestionTipo;
  empresaUsuario?: {
    id_usuario: number;
    id_empresa: number;
  } 
  organizacionUsuario?: {
    id_usuario: number;
    id_organizacion: number;
  }
}

export interface UserPoints {
  id: number;
  puntos: number;
}
