import { OrganizacionSummary } from "../organizaciones";
import { CampaignEstado } from "./enum";

/* ===============================
   CAMPAIGN BASE
================================ */
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
  ultimo_cambio: string;

  organizacion: OrganizacionSummary;
}

/* ===============================
   CREATE REQUEST
================================ */
export interface CampaignCreateRequest {
  titulo: string;
  imagen?: string;
  descripcion: string;

  fecha_Inicio: string;
  fecha_Fin: string;

  objetivo: number;

  estado?: CampaignEstado; 

  id_organizacion: number;
}

/* ===============================
   UPDATE REQUEST
================================ */
export interface CampaignUpdateRequest {
  titulo?: string;
  descripcion?: string;

  estado?: CampaignEstado; 

  fecha_Inicio: string;
  fecha_Fin?: string;

  objetivo?: number;
}

/* ===============================
   DETALLE
================================ */
export interface CampaignDetalle extends Campaign {
  imagenes: CampaignImagen[];
}

/* ===============================
   IMAGEN
================================ */
export interface CampaignImagen {
  id: number;
  url: string;
  nombre: string;
  esPortada?: boolean;
}
