'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import styles from '../../../styles/userCoupons.module.css';

type Coupon = {
  id: number;
  titulo: string;
  detalle: string;
  cantidad: number;
};

export default function UserCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 1,
      titulo: 'Descuento del 15%',
      detalle: 'Descuento en artículos de supermercado',
      cantidad: 2,
    },
    {
      id: 2,
      titulo: '2x1 en Cine',
      detalle: 'Válido de lunes a jueves',
      cantidad: 1,
    },
  ]);

  const handleUseCoupon = async (coupon: Coupon) => {
    if (coupon.cantidad <= 0) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Querés usar el cupón "${coupon.titulo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, usar',
      cancelButtonText: 'No',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id
            ? { ...c, cantidad: c.cantidad - 1 }
            : c,
        ),
      );

      Swal.fire({
        title: 'Cupón usado',
        text: 'La información del cupón fue enviada a tu mail',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mis cupones</h2>

      {coupons.length === 0 && (
        <p className={styles.empty}>No tenés cupones disponibles</p>
      )}

      {coupons.map((coupon) => (
        <div key={coupon.id} className={styles.card}>
          <h4 className={styles.couponTitle}>{coupon.titulo}</h4>
          <p className={styles.detail}>{coupon.detalle}</p>

          <p className={styles.amount}>
            Cantidad: <strong>{coupon.cantidad}</strong>
          </p>

          <button
            className={
              coupon.cantidad === 0
                ? styles.buttonDisabled
                : styles.button
            }
            onClick={() => handleUseCoupon(coupon)}
            disabled={coupon.cantidad === 0}
          >
            Usar
          </button>
        </div>
      ))}
    </div>
  );
}
