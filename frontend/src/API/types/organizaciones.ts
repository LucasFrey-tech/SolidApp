/**
 * Respuesta completa de Organización (ResponseOrganizacionDto)
 */
export interface Organizacion {
  id: number;
  cuit: string;
  razon_social: string;
  nombre_organizacion: string;
  descripcion: string;
  web: string;
  verificada: boolean;
  habilitada: boolean;       // reemplaza "deshabilitado"

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
  fecha_registro?: Date;
  /** @future campo no usado actualmente en el backend */
  ultimo_cambio?: Date;
}

/**
 * Payload para registrar una nueva organización junto con su gestor
 */
export interface OrganizacionRegistroRequest {
  // Datos del gestor
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  clave: string;
  telefono: string;
  // Datos de la organización
  correo_organizacion: string;
  cuit_organizacion: string;
  razon_social: string;
  nombre_organizacion: string;
  calle: string;
  numero: string;
  web?: string;
}

/**
 * Actualizar organización (UpdateOrganizacionDto)
 */
export interface OrganizacionUpdateRequest {
  descripcion?: string;
  web?: string;

  // ── campos reservados para uso futuro ──────────────────
  /** @future cuando el backend soporte actualizar desde este DTO */
  telefono?: string;
  /** @future cuando el backend soporte deshabilitar desde este DTO */
  deshabilitado?: boolean;
  /** @future campo no usado actualmente en el backend */
  actividad?: string;
  /** @future campo no usado actualmente en el backend */
  direccion?: string;
}

export interface OrganizacionSummary {
  id: number;
  razon_social: string;
  nombre_organizacion: string;
  verificada: boolean;
  total_campaigns: number;
}

export interface OrganizacionImagen {
  id: number;
  organizacion_id: number;
  url: string;
  es_principal: boolean;
}

// Mantenido para uso futuro (era OrganizacionCreateRequest)
/** @future reemplazado por OrganizacionRegistroRequest */
export interface OrganizacionCreateRequest {
  cuit: string;
  razon_social: string;
  nombre_organizacion: string;
  descripcion: string;
  telefono: string;
  web: string;
  correo: string;
  clave: string;
}