//import { Campaigns } from './campaigns';

export interface Organizacion {
  id: number;
  nroDocumento: string;
  razonSocial: string;
  nombreFantasia: string;
  descripcion: string;
  telefono: string;
  direccion: string;
  web: string;
  correo: string;
  clave: string;
  verificada: boolean;
  deshabilitado: boolean;
  fechaRegistro: Date;
  ultimoCambio: Date;
  //campaigns?: Campaigns[];
}

export interface OrganizacionCreateRequest {
  nroDocumento: string;
  razonSocial: string;
  nombreFantasia: string;
  descripcion: string;
  telefono: string;
  web: string;
  correo: string;
  clave: string;
}

export interface OrganizacionUpdateRequest {
  nroDocumento?: string;
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
  razonSocial: string;
  nombreFantasia: string;
  verificada: boolean;
  total_campaigns: number;
}

export interface OrganizacionImagen {
  id: number;
  organizacion_id: number;
  url: string;
  es_principal: boolean;
}