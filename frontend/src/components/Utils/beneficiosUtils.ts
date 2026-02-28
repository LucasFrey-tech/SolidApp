import { Beneficio, BeneficiosEstado } from "@/API/types/beneficios";

export const isBeneficioAprobado = (beneficio?: Beneficio): boolean => {
  if (!beneficio) return false;
  return beneficio.estado === BeneficiosEstado.APROBADO;
};

export const isBeneficioVisible = (beneficio?: Beneficio): boolean => {
  if (!beneficio) return false;

  // El beneficio debe estar aprobado
  if (!isBeneficioAprobado(beneficio)) return false;

  // La empresa debe existir
  if (!beneficio.empresa) return false;

  // La empresa no debe estar deshabilitada
  if (beneficio.empresa.deshabilitado) return false;

  return true;
};
