/**
 * Respuesta completa de Empresa (EmpresaResponseDTO)
 */
export interface Empresa {
  id: number;
  cuit_empresa: string;
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
  cuit_empresa: string;
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
  cuit_empresa?: string;
  razon_social?: string;
  nombre_fantasia?: string;
  descripcion?: string;
  rubro?: string;
  telefono?: string;
  direccion?: string;
  web?: string;
  deshabilitado?: boolean;
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
  logo?: string;
}