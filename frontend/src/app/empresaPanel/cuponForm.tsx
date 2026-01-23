"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import styles from "@/styles/couponForm.module.css";

type Coupon = {
  id: number;
  titulo: string;
  detalle: string;
  cantidad: number;
};

type Props = {
  coupon?: Coupon;
  onClose: () => void;
  onSuccess: (data: Partial<Coupon>) => void;
};

export function CouponForm({ coupon, onClose, onSuccess }: Props) {
  const [titulo, setTitulo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [cantidad, setCantidad] = useState<number>(0);

  useEffect(() => {
    if (coupon) {
      setTitulo(coupon.titulo);
      setDetalle(coupon.detalle);
      setCantidad(coupon.cantidad);
    }
  }, [coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Querés guardar los cambios realizados?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      onSuccess({
        titulo,
        detalle,
        cantidad,
      });

      Swal.fire({
        title: "¡Cambios enviados!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>
        {coupon ? "Editar cupón" : "Agregar cupón"}
      </h3>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* NOMBRE */}
        <div className={styles.field}>
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Ej: Descuento 20%"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        {/* DETALLE */}
        <div className={styles.field}>
          <label>Detalle</label>
          <textarea
            placeholder="Descripción del beneficio"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
          />
        </div>

        {/* CANTIDAD */}
        <div className={styles.field}>
          <label>Cantidad disponible</label>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>

          <button type="submit">Guardar</button>
        </div>
      </form>
    </div>
  );
}
