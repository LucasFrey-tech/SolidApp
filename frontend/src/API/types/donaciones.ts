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
  usuario: {
    id: number;
    nombre: string;
    correo: string;
  };
  campaña: {
    id: number;
    titulo: string;
  };
}
