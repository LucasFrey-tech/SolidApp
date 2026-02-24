/**
 * Respuesta completa de Empresa (EmpresaResponseDTO)
 */
export interface Empresa {
  id: number;
  cuit_empresa: string;
  razon_social: string;
  nombre_empresa: string;
  correo: string;
  descripcion?: string;
  rubro?: string;
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

export interface EmpresaSummary {
  nombre_empresa: string;
  logo: string;
}