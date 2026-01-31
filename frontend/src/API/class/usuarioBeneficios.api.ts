const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ===============================
   TIPOS
================================ */
export type UsuarioBeneficio = {
  id: number;
  cantidad: number;
  usados: number;
  estado: 'activo' | 'usado' | 'vencido';
  fecha_reclamo: string;
  beneficio: {
    id: number;
    titulo: string;
    detalle: string;
    valor: number;
  };
};

/* ===============================
   HELPERS
================================ */
function getAuthHeaders() {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/* ===============================
   API CALLS
================================ */

/** Traer cupones del usuario */
export async function getUserCoupons(usuarioId: number) {
  const res = await fetch(
    `${API_URL}/usuarios-beneficios/usuario/${usuarioId}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error('Error al obtener cupones del usuario');
  }

  return res.json() as Promise<UsuarioBeneficio[]>;
}

/** Usar un cupón */
export async function useCoupon(usuarioBeneficioId: number) {
  const res = await fetch(
    `${API_URL}/usuarios-beneficios/${usuarioBeneficioId}/usar`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error('Error al usar el cupón');
  }

  return res.json();
}
