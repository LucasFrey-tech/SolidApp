import { Contacto } from "./contacto/contacto";
import { Direccion } from "./direccion/direccion";

/**
 * Respuesta completa de Empresa (EmpresaResponseDTO)
 */
export interface Empresa {
  id: number;
  cuit: string;
  razon_social: string;
  nombre_empresa: string;
  descripcion?: string;
  rubro?: string;
  web?: string;
  verificada: boolean;
  habilitada: boolean;
  logo?: string;
  contacto: Contacto
  direccion: Direccion;

  fecha_registro?: string;
  ultimo_cambio?: string;
}



/**
 * Payload para actualizar empresa (UpdateEmpresaDTO)
 */
export interface EmpresaUpdateRequest {
  cuit?: string;
  razon_social?: string;
  nombre_organizacion?: string;
  descripcion?: string;
  web?: string;
  logo?: string;
  verificada?: boolean;
  habilitada?: boolean;     
  contacto?: Contacto;
  direccion?: Direccion;  
}

/**
 * Payload para registrar una nueva empresa junto con su gestor
 */
export interface EmpresaRegistroRequest {
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  clave: string;
  telefono: string;
  correo_empresa: string;
  cuit_empresa: string;
  razon_social: string;
  nombre_empresa: string;
  calle: string;
  numero: string;
  web?: string;
}

export interface EmpresaSummary {
  nombre_empresa: string;
  logo: string;
  deshabilitado: boolean;
}
