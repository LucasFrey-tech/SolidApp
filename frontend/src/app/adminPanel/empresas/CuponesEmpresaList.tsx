'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/adminUsersPanel.module.css';
import { BaseApi } from '@/API/baseApi';

/* ===============================
   TYPES
================================ */
type Cupon = {
  id: number;
  empresa: string;
  nombre: string;
  quantity: number;
  points: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
};

const PAGE_SIZE = 10;

export default function CuponesEmpresaList() {
  const [page, setPage] = useState(1);
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [cuponesCount, setCuponesCount] = useState(0);

  /* ===============================
     CARGAR CUPONES
  ================================ */
  useEffect(() => {
    async function fetchCupones() {
      try {
        setLoading(true);
        const api = new BaseApi();

        const res = await api.beneficio.getAllPaginated(
          page,
          PAGE_SIZE,
          search,
        );

        const cuponesFormated: Cupon[] = res.items.map((u: any) => ({
          id: u.id,
          empresa: u.empresa?.razon_social ?? '—',
          nombre: u.titulo,
          quantity: u.cantidad,
          points: u.valor,
          estado: u.estado,
        }));

        setCupones(cuponesFormated);
        setCuponesCount(res.total);
      } catch (error) {
        console.error(error);
        Swal.fire(
          'Error',
          'No se pudieron cargar los cupones',
          'error',
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCupones();
  }, [page, search]);

  /* ===============================
     BUSCADOR
  ================================ */
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  /* ===============================
     TOGGLE VISUAL
  ================================ */
const toggleCupon = async (cupon: Cupon) => {
  const nuevoEstado =
    cupon.estado === 'aprobado' ? 'rechazado' : 'aprobado';

  const result = await Swal.fire({
    title:
      nuevoEstado === 'aprobado'
        ? '¿Aprobar cupón?'
        : '¿Rechazar cupón?',
    text: `${cupon.empresa} - ${cupon.nombre}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar',
  });

  if (!result.isConfirmed) return;

  try {
    const api = new BaseApi();

    // 🔥 LLAMADA REAL A LA API
    await api.beneficio.updateEstado(cupon.id, {
      estado: nuevoEstado,
    });

    // 🔄 ACTUALIZAR FRONT SOLO SI SALIÓ BIEN
    setCupones((prev) =>
      prev.map((c) =>
        c.id === cupon.id
          ? { ...c, estado: nuevoEstado }
          : c,
      ),
    );

    Swal.fire({
      icon: 'success',
      title: 'Estado actualizado',
      timer: 1200,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error(error);

    Swal.fire(
      'Error',
      'No se pudo actualizar el estado',
      'error',
    );
  }
};


  const totalPages = Math.ceil(cuponesCount / PAGE_SIZE) || 1;

  if (loading) return <p>Cargando cupones...</p>;

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Cupones</h2>

      {/* BUSCADOR */}
      <input
        type="text"
        className={styles.Search}
        placeholder="Buscar por empresa o cupón..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {cupones.length === 0 ? (
        <p className={styles.Empty}>
          No se encontraron cupones
        </p>
      ) : (
        cupones.map((cupon) => (
          <div
            key={cupon.id}
            className={styles.UserRow}
          >
            <div>
              <strong>
                {cupon.empresa} – {cupon.nombre}
              </strong>

              <div className={styles.Email}>
                Cantidad: {cupon.quantity} | Puntos:{' '}
                {cupon.points}
              </div>
            </div>

            <div className={styles.Actions}>
              {/* APROBAR */}
              <button
                className={styles.Check}
                disabled={cupon.estado === 'aprobado'}
                onClick={() => toggleCupon(cupon)}
              >
                ✓
              </button>

              {/* RECHAZAR */}
              <button
                className={styles.Cross}
                disabled={cupon.estado !== 'aprobado'}
                onClick={() => toggleCupon(cupon)}
              >
                ✕
              </button>
            </div>
          </div>
        ))
      )}

      {/* PAGINACIÓN */}
      <div className={styles.Pagination}>
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Anterior
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
