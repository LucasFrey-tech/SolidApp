export interface RegistroUsuarioDto {
  nombre: string;
  apellido: string;
  documento: string;
}

export interface RegistroEmpresaDto {
  cuit_empresa: string;
  razon_social: string;
  nombre_empresa: string;
  web?: string;
}

export interface RegistroOrganizacionDto {
  cuit_organizacion: string;
  razon_social: string;
  nombre_organizacion: string;
  web?: string;
}

export enum RolCuenta {
  USUARIO = 'USUARIO',
  EMPRESA = 'EMPRESA',
  ORGANIZACION = 'ORGANIZACION',
  ADMIN = 'ADMIN',
}

export interface Register {
  correo: string;
  clave: string;
  role: RolCuenta;
  perfilUsuario?: RegistroUsuarioDto;
  perfilEmpresa?: RegistroEmpresaDto;
  perfilOrganizacion?: RegistroOrganizacionDto;
}

export interface AuthResponse {
  token: string;
}