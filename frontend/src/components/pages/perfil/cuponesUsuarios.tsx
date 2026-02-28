"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "../../../styles/UserPanel/usuario/userCoupons.module.css";
import { useUser } from "@/app/context/UserContext";
import {
  UsuarioBeneficio,
  BeneficiosUsuarioEstado,
} from "@/API/types/beneficios";
import { baseApi } from "@/API/baseApi";

export default function UserCoupons() {
  const { user, loading } = useUser();
  const [cupones, setCupones] = useState<UsuarioBeneficio[]>([]);
  const [loadingCupones, setLoadingCupones] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCoupons = async () => {
      setLoadingCupones(true);
      try {
        const data = await baseApi.users.getMisCuponesCanjeados();
        setCupones(data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudieron cargar los cupones", "error");
      } finally {
        setLoadingCupones(false);
      }
    };

    fetchCoupons();
  }, [user]);

  const handleUseCoupon = async (cupon: UsuarioBeneficio) => {
    const restantes = cupon.cantidad - cupon.usados;
    if (restantes <= 0) return;

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Querés usar el cupón "${cupon.beneficio.titulo}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, usar",
      cancelButtonText: "No",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await baseApi.users.usarCupon(cupon.id);

        setCupones((prev) =>
          prev.map((c) =>
            c.id === cupon.id
              ? {
                  ...c,
                  usados: c.usados + 1,
                  estado:
                    c.usados + 1 === c.cantidad
                      ? BeneficiosUsuarioEstado.USADO
                      : BeneficiosUsuarioEstado.ACTIVO,
                }
              : c,
          ),
        );

        Swal.fire(
          "Cupón usado",
          "La información del cupón fue enviada a tu mail",
          "success",
        );
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo usar el cupón", "error");
      }
    }
  };

  if (loading || loadingCupones) {
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        Cargando cupones...
      </p>
    );
  }

  if (!user) {
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        Debes iniciar sesión para ver tus cupones
      </p>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mis cupones</h2>

      {cupones.length === 0 && (
        <p className={styles.empty}>No tenés cupones disponibles</p>
      )}

      {cupones.map((cupon) => {
        const restantes = cupon.cantidad - cupon.usados;
        return (
          <div key={cupon.id} className={styles.card}>
            <h4 className={styles.couponTitle}>{cupon.beneficio.titulo}</h4>
            <p className={styles.detail}>{cupon.beneficio.detalle}</p>

            <p className={styles.amount}>
              Cantidad restante: <strong>{restantes}</strong>
            </p>

            <button
              className={restantes <= 0 ? styles.buttonDisabled : styles.button}
              onClick={() => handleUseCoupon(cupon)}
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
