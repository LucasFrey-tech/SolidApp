"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import styles from "@/styles/couponForm.module.css";

type Coupon = {
  id: number;
  titulo: string;
  detalle: string;
  cantidad: number;
  valor: number;
};

type Props = {
  coupon?: Coupon;
  onClose: () => void;
  onSuccess: (data: Partial<Coupon>) => Promise<void>;
};

export function CouponForm({ coupon, onClose, onSuccess }: Props) {
  const [titulo, setTitulo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [valor, setValor] = useState<number>(0);

  useEffect(() => {
    if (coupon) {
      setTitulo(coupon.titulo);
      setDetalle(coupon.detalle);
      setCantidad(coupon.cantidad);
      setValor(coupon.valor);
    }
  }, [coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Querés guardar los cambios?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await onSuccess({
        titulo,
        detalle,
        cantidad,
        valor,
      });

      Swal.fire({
        title: "¡Guardado!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      onClose();
    } catch {
      Swal.fire("Error", "No se pudo guardar el cupón", "error");
    }
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>
        {coupon ? "Editar cupón" : "Agregar cupón"}
      </h3>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label>Nombre</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Detalle</label>
          <textarea
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Cantidad</label>
          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Puntos para canjear</label>
          <input
            type="number"
            min={0}
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            required
          />
        </div>

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
