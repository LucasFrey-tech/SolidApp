'use client';

import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/adminUsersPanel.module.css';

type Coupon = {
  id: number;
  name: string;
  quantity: number;
  points: number;
  enabled: boolean;
};

const MOCK_COUPONS: Coupon[] = Array.from({ length: 16 }).map((_, i) => ({
  id: i + 1,
  name: `Cupón Empresa ${i + 1}`,
  quantity: Math.floor(Math.random() * 100) + 1,
  points: (i + 1) * 10,
  enabled: i % 4 !== 0,
}));

const PAGE_SIZE = 5;

export default function EmpresasAdminPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);

  /* ===============================
     FILTRO
  ================================ */
  const filteredCoupons = useMemo(() => {
    const value = search.toLowerCase();

    return coupons.filter(coupon =>
      coupon.name.toLowerCase().includes(value)
    );
  }, [coupons, search]);

  /* ===============================
     PAGINACIÓN
  ================================ */
  const totalPages = Math.ceil(filteredCoupons.length / PAGE_SIZE) || 1;
  const start = (page - 1) * PAGE_SIZE;
  const currentCoupons = filteredCoupons.slice(start, start + PAGE_SIZE);

  /* ===============================
     TOGGLE CUPON
  ================================ */
  const confirmToggleCoupon = (coupon: Coupon) => {
    Swal.fire({
      title: coupon.enabled
        ? '¿Deshabilitar cupón?'
        : '¿Habilitar cupón?',
      text: `Cupón: ${coupon.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        setCoupons(prev =>
          prev.map(c =>
            c.id === coupon.id ? { ...c, enabled: !c.enabled } : c
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

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Cupones de Empresa</h2>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar cupón..."
        className={styles.Search}
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* 📦 LISTA */}
      {currentCoupons.length === 0 && (
        <p className={styles.Empty}>No se encontraron cupones</p>
      )}

      {currentCoupons.map(coupon => (
        <div key={coupon.id} className={styles.UserRow}>
          <div>
            <strong>{coupon.name}</strong>

            <div className={styles.Email}>
              Cantidad: {coupon.quantity} — Puntos: {coupon.points}
            </div>
          </div>

          <div className={styles.Actions}>
            <button
              className={styles.Check}
              disabled={coupon.enabled}
              onClick={() => confirmToggleCoupon(coupon)}
            >
              ✓
            </button>

            <button
              className={styles.Cross}
              disabled={!coupon.enabled}
              onClick={() => confirmToggleCoupon(coupon)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}

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
