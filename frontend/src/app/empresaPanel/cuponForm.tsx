"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import styles from "@/styles/Paneles/couponForm.module.css";

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

  const isEditing = !!coupon;

  const [titulo, setTitulo] = useState("");
  const [detalle, setDetalle] = useState("");

  // usar string permite vacío sin forzar 0
  const [cantidad, setCantidad] = useState("1");
  const [valor, setValor] = useState("");

  useEffect(() => {

    if (coupon) {
      setTitulo(coupon.titulo ?? "");
      setDetalle(coupon.detalle ?? "");
      setCantidad(
        coupon.cantidad !== undefined
          ? String(coupon.cantidad)
          : "1"
      );
      setValor(
        coupon.valor !== undefined
          ? String(coupon.valor)
          : ""
      );
    }
    else {
      setTitulo("");
      setDetalle("");
      setCantidad("1");
      setValor("");
    }

  }, [coupon]);


  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    const result = await Swal.fire({
      title: isEditing
        ? "¿Guardar cambios?"
        : "¿Crear cupón?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isEditing
        ? "Guardar"
        : "Crear",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true,
      target: document.body
    });

    if (!result.isConfirmed) return;

    try {

      await onSuccess({
        titulo,
        detalle,

        // convertir correctamente sin forzar 0 si está vacío
        cantidad:
          cantidad.trim() === ""
            ? 0
            : Number(cantidad),

        valor:
          valor.trim() === ""
            ? 0
            : Number(valor),
      });

      await Swal.fire({
        title: isEditing
          ? "Cupón actualizado correctamente y enviado para revisión"
          : "Cupón enviado para revisión",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
        target: document.body
      });

      onClose();

    }
    catch {

      Swal.fire({
        title: "Error",
        text: "No se pudo guardar",
        icon: "error",
        target: document.body
      });

    }

  };

  return (

    <div className={styles.panel}>

      <h3 className={styles.title}>
        {isEditing
          ? "Editar cupón"
          : "Crear cupón"}
      </h3>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >

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
            inputMode="numeric"
            value={cantidad}
            onChange={(e) => {

              const val = e.target.value;

              // permite vacío
              if (val === "") {
                setCantidad("");
                return;
              }

              // solo números positivos
              if (/^\d+$/.test(val)) {
                setCantidad(val);
              }

            }}
            min="1"
            className={styles.noSpinner}
            required
          />

        </div>


        <div className={styles.field}>

          <label>Puntos para canjear</label>

          <input
            type="number"
            inputMode="numeric"
            value={valor}
            onChange={(e) => {

              const val = e.target.value;

              if (val === "") {
                setValor("");
                return;
              }

              if (/^\d+$/.test(val)) {
                setValor(val);
              }

            }}
            min="0"
            placeholder="Ej: 100"
            className={styles.noSpinner}
          />

        </div>


        <div className={styles.actions}>

          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className={styles.primaryButton}
          >
            {isEditing
              ? "Guardar cambios"
              : "Crear"}
          </button>

        </div>

      </form>

    </div>

  );
}
