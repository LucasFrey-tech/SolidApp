export interface Donation {
  id: number;
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

export interface DonationResponse {
  id: number;
  descripcion: string;
  puntos: number;
  estado: string;

  userId: number;
  correo: string;
  
  campaignId: number;
  campaignTitulo: string;
}
