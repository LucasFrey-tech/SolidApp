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

export interface DonacionResponsePanel {
  id: number;
  descripcion: string;
  puntos: number;
  estado: number;

  userId: number;
  correo: string;
  
  campaignId: number;
  campaignTitulo: string;
  cantidad:number;
}

export interface CreateDonation {
  detalle: string;
  cantidad: number;
  usuarioId: number;
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
  nombreOrganizacion: string;
  fecha_estado: string;
  motivo_rechazo: string;
}