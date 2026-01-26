'use client';

import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/adminUsersPanel.module.css';

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

export default function CuponesEmpresaList() {
  const [cupones, setCupones] = useState<Cupon[]>(MOCK_CUPONES);
  const [search, setSearch] = useState('');

  /* ===============================
     FILTRO
  ================================ */
  const filteredCupones = useMemo(() => {
    const value = search.toLowerCase();
    return cupones.filter(
      c =>
        c.nombre.toLowerCase().includes(value) ||
        c.empresa.toLowerCase().includes(value)
    );
  }, [cupones, search]);

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

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Cupones</h2>

      {/*BUSCADOR */}
      <input
        type="text"
        className={styles.Search}
        placeholder="Buscar por empresa o cupón..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filteredCupones.length === 0 && (
        <p className={styles.Empty}>No se encontraron cupones</p>
      )}

      {filteredCupones.map(cupon => (
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
      ))}
    </div>
  );
}
