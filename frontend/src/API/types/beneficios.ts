import { EmpresaSummary } from "./empresas";


/**
 * Respuesta de Beneficio (BeneficiosResponseDTO)
 */
export interface Beneficio {
  id: number;
  titulo: string;
  tipo: string;
  detalle: string;
  cantidad: number;
  valor: number;
  fecha_registro: string;
  ultimo_cambio: string;
  empresa: EmpresaSummary;
}

/**
 * Crear beneficio (CreateBeneficiosDTO)
 */
export interface BeneficioCreateRequest {
  titulo: string;
  tipo: string;
  detalle: string;
  cantidad: number;
  valor: number;
  id_empresa: number;
}

/**
 * Actualizar beneficio (UpdateBeneficiosDTO)
 */
export interface BeneficioUpdateRequest {
  titulo?: string;
  tipo?: string;
  detalle?: string;
  cantidad?: number;
  valor?: number,
  id_empresa?: number;
}