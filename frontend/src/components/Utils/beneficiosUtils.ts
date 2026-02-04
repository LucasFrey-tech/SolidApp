import { Beneficio } from '@/API/types/beneficios';

export const isBeneficioAprobado = (b?: Beneficio): boolean =>
    b?.estado?.toLowerCase() === 'aprobado';

export const isBeneficioVisible = (b?: Beneficio): boolean =>
    isBeneficioAprobado(b);