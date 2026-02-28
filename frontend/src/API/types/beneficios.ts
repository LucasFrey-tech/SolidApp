import { EmpresaSummary } from "./empresas";

/* ===============================
   TIPOS DE ESTADO
================================ */
export enum BeneficiosEstado {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO'
}

export enum BeneficiosUsuarioEstado {
  ACTIVO = 'ACTIVO',
  USADO = 'USADO',
  VENCIDO = 'VENCIDO',
}

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
  estado: BeneficiosEstado;
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
   UPDATE ESTADO BENEFICIO
================================ */

export interface UsuarioBeneficio {
  id: number;
  cantidad: number;
  usados: number;
  estado: BeneficiosUsuarioEstado
  fecha_reclamo: string;
  fecha_uso?: string;
  beneficio: {
    id: number;
    titulo: string;
    detalle: string;
    valor: number;
  };
}