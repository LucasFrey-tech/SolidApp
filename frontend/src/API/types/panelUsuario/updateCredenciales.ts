export interface UpdateCredentialsPayload {
  correo?: string;
  passwordActual: string;
  passwordNueva?: string;
}