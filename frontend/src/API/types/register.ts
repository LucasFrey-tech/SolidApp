// Usuario
export interface RegisterUsuarioRequest {
  documento: string;
  nombre: string;
  apellido: string;
  correo: string;
  clave: string;
}

// Empresa
export interface RegisterEmpresaRequest {
  documento: string;
  razonSocial: string;
  nombreFantasia: string;
  correo: string;
  clave: string;
  telefono: string;
  direccion: string;
  web?: string;
}

// Organización
export interface RegisterOrganizacionRequest {
  documento: string;
  razonSocial: string;
  nombreFantasia: string;
  correo: string;
  clave: string;
}

export interface AuthResponse {
  token: string;
}