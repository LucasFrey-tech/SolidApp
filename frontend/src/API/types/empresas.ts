/**
 * Respuesta completa de Empresa (EmpresaResponseDTO)
 */
export interface Empresa {
  id: number;
  cuit: string;
  razon_social: string;
  nombre_empresa: string;
  descripcion?: string;
  rubro?: string;           // reemplaza "actividad"
  web?: string;
  verificada: boolean;
  habilitada: boolean;      // reemplaza "deshabilitado"
  fecha_registro?: string;  // opcional: no siempre viene en el DTO de respuesta
  ultimo_cambio?: string;
  logo?: string;

  // ── campos reservados para uso futuro ──────────────────
  /** @future puede venir del contacto asociado */
  correo?: string;
  /** @future puede venir del contacto asociado */
  telefono?: string;
  /** @future puede venir de la dirección asociada */
  calle?: string;
  /** @future puede venir de la dirección asociada */
  numero?: string;
  /** @future puede venir de la dirección asociada */
  provincia?: string;
  /** @future puede venir de la dirección asociada */
  ciudad?: string;
  /** @future puede venir de la dirección asociada */
  codigo_postal?: string;
  /** @future campo no usado actualmente en el backend */
  prefijo?: string;
  /** @future campo no usado actualmente en el backend */
  actividad?: string;
}

/**
 * Payload para actualizar empresa (UpdateEmpresaDTO)
 */
export interface EmpresaUpdateRequest {
  descripcion?: string;
  rubro?: string;     // reemplaza "actividad"
  web?: string;
  logo?: string;      // nombre del archivo, lo maneja el backend

  // ── campos reservados para uso futuro ──────────────────
  /** @future cuando el backend soporte actualizar dirección desde empresa */
  direccion?: string;
  /** @future cuando el backend soporte deshabilitar desde este DTO */
  deshabilitado?: boolean;
}

/**
 * Payload para registrar una nueva empresa junto con su gestor
 */
export interface EmpresaRegistroRequest {
  // Datos del gestor
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  clave: string;
  telefono: string;
  // Datos de la empresa
  correo_empresa: string;
  cuit_empresa: string;
  razon_social: string;
  nombre_empresa: string;
  calle: string;
  numero: string;
  web?: string;
}

export interface EmpresaSummary {
  nombre_empresa: string;
  logo: string;
  deshabilitado: boolean; // mantenido para uso futuro
}