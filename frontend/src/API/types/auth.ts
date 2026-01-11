export interface LoginRequestBody {
  correo: string;
  clave: string;
}

export interface RegisterRequestBody {
  nombre: string;
  apellido: string;
  correo: string;
  imagen: string;
  clave: string;
}


export interface AuthResponse {
  access_token: string;
}