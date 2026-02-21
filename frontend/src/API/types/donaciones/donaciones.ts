import { DonacionEstado } from "./enum";

export interface Donation {
  titulo: string;
  detalle: string;
  tipo: string;
  cantidad: number;
  estado: string;
  campaignId: number;
  userId: number;
  fecha_registro: string;
}

export interface DonacionImagen {
  id_donacion:number;
  imagen:string;
  nombre:string;
}

export interface DonationResponsePanel {
  id: number;
  descripcion: string;
  puntos: number;
  estado: number;

  userId: number;
  correo: string;
  
  campaignId: number;
  campaignTitulo: string;
}

export interface CreateDonation {
  detalle: string;
  cantidad: number;
  userId: number;
  campaignId: number;
  puntos: number;
}

export interface donacionUsuario {
  id: number;
  detalle: string;
  puntos: number;
  estado: DonacionEstado;
  cantidad: string
  fecha_registro: string;
  tituloCampaña: string;
  organizacionId: number;
  direccion: string;
  nombreOrganizacion: string;
  fecha_estado: string;
  motivo_rechazo: string;
}