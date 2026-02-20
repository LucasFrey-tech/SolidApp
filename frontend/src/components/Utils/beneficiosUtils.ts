import { Beneficio } from '@/API/types/beneficios';

export const isBeneficioAprobado = (b?: Beneficio): boolean =>
  b?.estado?.toLowerCase() === 'aprobado';

export const isBeneficioVisible = (b?: Beneficio): boolean => {
  if (!b) return false;

  // Debe estar aprobado
  if (!isBeneficioAprobado(b)) return false;

  // La empresa debe existir
  if (!b.empresa) return false;

  // La empresa NO debe estar deshabilitada
  if (b.empresa.deshabilitado) return false;

  return true;
};