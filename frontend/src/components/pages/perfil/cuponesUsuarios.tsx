'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import styles from '../../../styles/userCoupons.module.css';
import { useUser } from '@/app/context/UserContext';
import { getUserCoupons, useCoupon, UsuarioBeneficio } from '@/API/class/usuarioBeneficios.api';

export default function UserCoupons() {
  const { user, loading } = useUser();
  const [coupons, setCoupons] = useState<UsuarioBeneficio[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  // Traer cupones del usuario al montar
  useEffect(() => {
    if (!user) return;

    const fetchCoupons = async () => {
      setLoadingCoupons(true);
      try {
        const data = await getUserCoupons(user.sub);
        setCoupons(data);
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los cupones', 'error');
      } finally {
        setLoadingCoupons(false);
      }
    };

    fetchCoupons();
  }, [user]);

  // Manejar uso de un cupón
  const handleUseCoupon = async (coupon: UsuarioBeneficio) => {
    const restantes = coupon.cantidad - coupon.usados;
    if (restantes <= 0) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Querés usar el cupón "${coupon.beneficio.titulo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, usar',
      cancelButtonText: 'No',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await useCoupon(coupon.id);
        // Actualizo la cantidad usada en el estado
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id
              ? { ...c, usados: c.usados + 1, estado: c.usados + 1 === c.cantidad ? 'usado' : 'activo' }
              : c
          )
        );

        Swal.fire(
          'Cupón usado',
          'La información del cupón fue enviada a tu mail',
          'success'
        );
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo usar el cupón', 'error');
      }
    }
  };

  if (loading || loadingCoupons) {
    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando cupones...</p>;
  }

  if (!user) {
    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Debes iniciar sesión para ver tus cupones</p>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mis cupones</h2>

      {coupons.length === 0 && (
        <p className={styles.empty}>No tenés cupones disponibles</p>
      )}

      {coupons.map((coupon) => {
        const restantes = coupon.cantidad - coupon.usados;
        return (
          <div key={coupon.id} className={styles.card}>
            <h4 className={styles.couponTitle}>{coupon.beneficio.titulo}</h4>
            <p className={styles.detail}>{coupon.beneficio.detalle}</p>

            <p className={styles.amount}>
              Cantidad restante: <strong>{restantes}</strong>
            </p>

            <button
              className={restantes <= 0 ? styles.buttonDisabled : styles.button}
              onClick={() => handleUseCoupon(coupon)}
              disabled={restantes <= 0}
            >
              Usar
            </button>
          </div>
        );
      })}
    </div>
  );
}
