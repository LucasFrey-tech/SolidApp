export interface Organizacion {
  id: number;
  cuit_organizacion: string;
  razon_social: string;
  nombre_organizacion: string;
  descripcion: string;
  prefijo: string;
  telefono: string;
  calle: string;
  numero: string
  provincia: string;
  ciudad: string;
  codigo_postal: string;
  web: string;
  correo: string;
  clave: string;
  verificada: boolean;
  deshabilitado: boolean;
  fecha_registro: Date;
  ultimo_Cambio: Date;
}

export interface OrganizacionCreateRequest {
  cuit_organizacion: string;
  razonSocial: string;
  nombreFantasia: string;
  descripcion: string;
  telefono: string;
  web: string;
  correo: string;
  clave: string;
}

export interface OrganizacionUpdateRequest {
  cuit_organizacion: string;
  razonSocial?: string;
  nombreFantasia?: string;
  descripcion?: string;
  telefono?: string;
  direccion?: string;
  web?: string;
  verificada?: boolean;
  deshabilitado?: boolean;
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