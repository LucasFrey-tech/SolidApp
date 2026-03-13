export enum Rol {
  USUARIO = "USUARIO",
  GESTOR = 'GESTOR',
  ADMIN = 'ADMIN',
}

export interface LoginRequestBody {
  correo: string;
  clave: string;
}

export interface RegisterRequestBody {
  nombre: string;
  apellido: string;
  correo: string;
  imagen: string;
  clave: string;
}

export interface RegistroUsuarioDto {
  correo: string;
  clave: string;
  nombre: string;
  apellido: string;
  documento: string;
}

export interface RegistroEmpresaDto {
  cuit: string;
  razon_social: string;
  nombre_empresa: string;
  web?: string;
}

export interface RegistroOrganizacionDto {
  cuit: string;
  razon_social: string;
  nombre_organizacion: string;
  web?: string;
}

export interface AuthResponse {
  token: string;
}
