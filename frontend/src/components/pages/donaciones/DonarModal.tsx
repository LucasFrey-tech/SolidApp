"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import styles from "@/styles/Donar/donarModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
  campaignTitle: string;
  userId: number;
  puntosPorArticulo: number;
}

export default function DonarModal({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  userId,
  puntosPorArticulo,
}: Props) {
  const [detalle, setDetalle] = useState("");
  const [cantidad, setCantidad] = useState(1);

  if (!isOpen) return null;

  const puntos = cantidad * puntosPorArticulo;

  const handleSubmit = async () => {
    if (!detalle.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Detalle requerido",
        text: "Por favor escribí un detalle para la donación.",
        confirmButtonColor: "#22c55e",
        background: "#1f1f1f",
        color: "#fff",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      html: `
        Vas a donar <b>${cantidad}</b> artículo(s).<br/>
        Recibirás <b>${puntos}</b> puntos.
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, donar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#555",
      background: "#1f1f1f",
      color: "#fff",
    });

    if (!confirm.isConfirmed) return;

    const body = {
      titulo: campaignTitle,
      detalle,
      tipo: "articulo",
      cantidad,
      fecha_registro: new Date(),
      id_campaña: campaignId,
      usuarioId: userId,
      puntos,
      estado: "pendiente",
      fecha_estado: null,
      motivo_rechazo: "",
    };

    try {
      console.log("DONACION:", body);

      // await api.donaciones.create(body);

      await Swal.fire({
        icon: "success",
        title: "Donación enviada",
        text: "Tu donación fue enviada correctamente.",
        confirmButtonColor: "#22c55e",
        background: "#1f1f1f",
        color: "#fff",
      });

      setDetalle("");
      setCantidad(1);
      onClose();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar la donación.",
        confirmButtonColor: "#ef4444",
        background: "#1f1f1f",
        color: "#fff",
      });
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>
          Donar a <span>{campaignTitle}</span>
        </h2>

        <div className={styles.separator}></div>

        <label className={styles.label}>Detalle de la donación</label>

        <textarea
          placeholder="Escribí un detalle sobre tu donación..."
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          className={styles.textarea}
        />

        <div className={styles.separator}></div>

        <label className={styles.label}>Cantidad</label>

        <div className={styles.cantidadContainer}>
          <button
            onClick={() => cantidad > 1 && setCantidad(cantidad - 1)}
          >
            -
          </button>

          <span>{cantidad}</span>

          <button onClick={() => setCantidad(cantidad + 1)}>
            +
          </button>
        </div>

        <p className={styles.puntos}>
          Puntos que vas a recibir: <strong>{puntos}</strong>
        </p>

        <div className={styles.actions}>
          <button onClick={handleSubmit} className={styles.confirm}>
            Confirmar donación
          </button>

          <button onClick={onClose} className={styles.cancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
