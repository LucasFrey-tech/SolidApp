import { OrganizacionSummary } from "../organizaciones";

export interface Campaign {
  id: number;
  imagenPortada?: string | null;
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
  imagen: string;
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

export interface CampaignDetalle extends Campaign {
  imagenes: CampaignImagen[];
}

export interface CampaignImagen {
  id:number;
  url:string;
  nombre:string;
  esPortada?: boolean;
}
