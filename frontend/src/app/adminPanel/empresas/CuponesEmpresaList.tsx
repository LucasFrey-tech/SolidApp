'use client';

import { useState, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/adminUsersPanel.module.css';
import { BaseApi } from '@/API/baseApi';

type Cupon = {
  id: number;
  empresa: string;
  nombre: string;
  quantity: number;
  points: number;
  enabled: boolean;
};

/* ===============================
   MOCK CUPONES
================================ */
const MOCK_CUPONES: Cupon[] = Array.from({ length: 15 }).map((_, i) => ({
  id: i + 1,
  empresa: `Empresa ${Math.floor(i / 3) + 1}`,
  nombre: `Cupón ${i + 1}`,
  quantity: 10 + i,
  points: 100 * (i + 1),
  enabled: i % 2 === 0,
}));

const PAGE_SIZE = 10;

export default function CuponesEmpresaList() {
  const [page, setPage] = useState(1);
  const [cupones, setCupones] = useState<Cupon[]>(MOCK_CUPONES);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [cuponesCount, setCuponesCount] = useState(0);

  /* ===============================
     PAGINACIÓN
  ================================ */
  const totalPages = Math.ceil(cuponesCount / PAGE_SIZE) || 1;

  /* ===============================
     TOGGLE
  ================================ */
  const toggleCupon = (cupon: Cupon) => {
    Swal.fire({
      title: cupon.enabled
        ? '¿Deshabilitar cupón?'
        : '¿Habilitar cupón?',
      text: `${cupon.empresa} - ${cupon.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then(res => {
      if (res.isConfirmed) {
        setCupones(prev =>
          prev.map(c =>
            c.id === cupon.id ? { ...c, enabled: !c.enabled } : c
          )
        );

        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  useEffect(() => {
    async function fetchUsers() {
      const api = new BaseApi();
      const res = await api.beneficio.getAllPaginated(page, PAGE_SIZE, search);
      const cuponesFormated = res.items.map((u: any) => ({
        id: u.id,
        empresa: u.empresa.razon_social,
        nombre: u.titulo,
        quantity: u.cantidad,
        points: u.valor,
        enabled: u.estado == 'aprobado'? true : false,
      }));
      console.log(res);
      setCupones(cuponesFormated);
      setCuponesCount(res.total);
      setLoading(false);
    }

    fetchUsers();
  }, [page, search]);

  /* ===============================
     RESET PAGE AL BUSCAR
  ================================ */
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (loading) return <p>Cargando empresas...</p>;

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Cupones</h2>

      {/*BUSCADOR */}
      <input
        type="text"
        className={styles.Search}
        placeholder="Buscar por empresa o cupón..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {
        cupones.length === 0 ?
          <p className={styles.Empty}>No se encontraron cupones</p>
        :
          cupones.map(cupon => (
            <div key={cupon.id} className={styles.UserRow}>
              <div>
                {/* NOMBRE EMPRESA - CUPÓN */}
                <strong>
                  {cupon.empresa} – {cupon.nombre}
                </strong>

                <div className={styles.Email}>
                  Cantidad: {cupon.quantity} | Puntos: {cupon.points}
                </div>
              </div>

              <div className={styles.Actions}>
                <button
                  className={styles.Check}
                  disabled={cupon.enabled}
                  onClick={() => toggleCupon(cupon)}
                >
                  ✓
                </button>

                <button
                  className={styles.Cross}
                  disabled={!cupon.enabled}
                  onClick={() => toggleCupon(cupon)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
      }

      {/* 📄 PAGINACIÓN */}
      <div className={styles.Pagination}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Anterior
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
