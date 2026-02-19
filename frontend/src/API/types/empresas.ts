/**
 * Respuesta completa de Empresa (EmpresaResponseDTO)
 */
export interface Empresa {
  id: number;
  nroDocumento: string;
  razon_social: string;
  nombre_fantasia: string;
  correo: string;
  descripcion: string;
  rubro: string;
  telefono: string;
  direccion: string;
  web: string;
  verificada: boolean;
  deshabilitado: boolean;
  fecha_registro: string;
  ultimo_cambio: string;
  logo: string;
}

/**
 * Crear empresa (CreateEmpresaDTO)
 */
export interface EmpresaCreateRequest {
  nroDocumento: string;
  razon_social: string;
  nombre_fantasia?: string;
  correo: string;
  descripcion: string;
  rubro: string;
  telefono: string;
  direccion: string;
  web?: string;
}

/**
 * Actualizar empresa (UpdateEmpresaDTO)
 */
export interface EmpresaUpdateRequest {
  nroDocumento?: string;
  razon_social?: string;
  nombre_fantasia?: string;
  descripcion?: string;
  rubro?: string;
  telefono?: string;
  direccion?: string;
  web?: string;
  deshabilitado?: boolean;
  logo?: string;
}

/**
 * Resumen de empresa (EmpresaSummaryDTO)
 */
export interface EmpresaSummary {
  id: number;
  razon_social: string;
  nombre_fantasia: string;
  rubro: string;
  verificada: boolean;
  deshabilitado: boolean;
}