import { OrganizacionSummary } from "../organizaciones";
import { CampaignEstado } from "./enum";

export interface Campaign {
  id: number;
  imagenPortada?: string;

  estado: CampaignEstado; 

  titulo: string;
  descripcion: string;

  fecha_Inicio: string;
  fecha_Fin: string;
  fecha_Registro: string;

  objetivo: number;
  puntos: number;
  ultimo_cambio: string;

  organizacion: OrganizacionSummary;
}

export interface CampaignCreateRequest {
  titulo: string;
  imagen?: string;
  descripcion: string;

  fecha_Inicio: string;
  fecha_Fin: string;

  objetivo: number;
  puntos: number;

  estado?: CampaignEstado; 
}

export interface CampaignUpdateRequest {
  titulo?: string;
  descripcion?: string;

  estado?: CampaignEstado; 

  fecha_Inicio?: string;
  fecha_Fin?: string;

  objetivo?: number;
  puntos?: number;
}

export interface CampaignDetalle extends Campaign {
  imagenes: CampaignImagen[];
}

export interface CampaignImagen {
  id: number;
  url: string;
  nombre: string;
  esPortada?: boolean;
}
