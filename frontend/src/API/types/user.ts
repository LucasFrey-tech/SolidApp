export interface User {
  id: number;
  documento: string;
  rol: string;
  correo: string;
  nombre: string;
  apellido: string;
  calle: string;
  numero: string
  prefijo: string;
  telefono: string;
  departamento?: string;
  codigoPostal: string;
  provincia: string;
  ciudad: string;
  deshabilitado: boolean; 
}

export interface UserPoints {
  id: number;
  puntos: number;
}