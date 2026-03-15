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
  habilitada: boolean;     
  contacto: Contacto;
  direccion: Direccion;  

  // ── campos reservados para uso futuro ──────────────────
  fecha_registro?: Date;
  ultimo_cambio?: Date;
}

  interface Contacto {
    telefono: string;
    prefijo: string;
  }

  interface Direccion {
    calle: string;
    numero: string;
    provincia: string;
    ciudad: string;
    codigo_postal: string;
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
  cuit?: string;
  razon_social?: string;
  nombre_organizacion?: string;
  descripcion?: string;
  web?: string;
  verificada?: boolean;
  habilitada?: boolean;     
  contacto?: Contacto;
  direccion?: Direccion;  
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