/**
 * Respuesta completa de Empresa (EmpresaResponseDTO)
 */
export interface Empresa {
  id: number;
  cuit: string;
  razon_social: string;
  nombre_empresa: string;
  correo: string;
  descripcion?: string;
  actividad?: string;
  prefijo?: string;
  telefono: string;
  calle: string;
  numero: string;
  provincia?: string;
  ciudad?: string;
  codigo_postal?: string;
  web?: string;
  verificada: boolean;
  deshabilitado: boolean;
  fecha_registro: string;
  ultimo_cambio: string;
  logo?: string;
}

/**
 * Actualizar empresa (UpdateEmpresaDTO)
 */
export interface EmpresaUpdateRequest {
  descripcion?: string;
  actividad?: string;
  telefono?: string;
  direccion?: string;
  web?: string;
  deshabilitado?: boolean;
}

export interface EmpresaSummary {
  nombre_empresa: string;
  logo: string;
  deshabilitado: boolean;
}