import { Cuenta } from '../../../Entities/cuenta.entity';
import { PerfilUsuario } from '../../../Entities/perfil_Usuario.entity';
import { PerfilEmpresa } from '../../../Entities/perfil_empresa.entity';
import { PerfilOrganizacion } from '../../../Entities/perfil_organizacion.entity';

// Tipo unión para los diferentes perfiles
export type PerfilAsociado =
  | PerfilUsuario
  | PerfilEmpresa
  | PerfilOrganizacion
  | Cuenta;

export interface UsuarioAutenticado {
  cuenta: Cuenta;
  perfil: PerfilAsociado;
}

// Extensión de la interfaz Request de Express
export type RequestConUsuario = Request & { user: UsuarioAutenticado };
