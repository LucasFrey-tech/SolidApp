import { OrganizacionSummary } from "../organizaciones";

export interface Campaign {
  id: number;
  estado: string;
  titulo: string;
  descripcion: string;
  fecha_Inicio: string;
  fecha_Fin: string;
  fecha_Registro: string;
  objetivo: number;
  ultimo_Cambio: string;
  organizacion: OrganizacionSummary;
}

export interface CampaignCreateRequest {
  titulo: string;
  descripcion: string;
  fecha_Inicio: string;
  fecha_Fin: string;
  objetivo: number;
  estado?: string;
  id_organizacion: number;
}

export interface CampaignUpdateRequest {
  titulo?: string;
  descripcion?: string;
  estado?: string;
  fecha_Inicio: string;
  fecha_Fin?: string;
  objetivo?: number;
}
