export interface RegisterRequestBody {
  nombre: string;
  apellido: string;
  correo: string;
  clave: string;
}
export interface AuthResponse {
  access_token: string;
}