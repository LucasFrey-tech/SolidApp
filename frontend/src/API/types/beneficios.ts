import { EmpresaSummary } from "./empresas";

/* ===============================
   TIPOS DE ESTADO
================================ */
export type BeneficioEstado =
  | 'pendiente'
  | 'aprobado'
  | 'rechazado';

/* ===============================
   RESPUESTA BENEFICIO
================================ */
export interface Beneficio {
  id: number;
  titulo: string;
  tipo: string;
  detalle: string;
  cantidad: number;
  fecha_registro: string;
  ultimo_cambio: string;
  valor: number;
  empresa: EmpresaSummary;
  estado: BeneficioEstado;
}

/* ===============================
   CREAR BENEFICIO
================================ */
export interface BeneficioCreateRequest {
  titulo: string;
  tipo: string;
  detalle: string;
  cantidad: number;
  valor: number;
  id_empresa: number;
}

/* ===============================
   UPDATE BENEFICIO (DATOS)
================================ */
export interface BeneficioUpdateRequest {
  titulo?: string;
  tipo?: string;
  detalle?: string;
  cantidad?: number;
  valor?: number;
  id_empresa?: number;
}

/* ===============================
   🔥 UPDATE ESTADO BENEFICIO
================================ */
export interface BeneficioUpdateEstadoRequest {
  estado: BeneficioEstado;
}
