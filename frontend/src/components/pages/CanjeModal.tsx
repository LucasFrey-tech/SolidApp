'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/canjeModal.module.css';

import { Beneficio } from '@/API/types/beneficios';

interface Props {
  beneficio: Beneficio;
  onClose: () => void;
}

export default function CanjeModal({ beneficio, onClose }: Props) {
  const [cantidad, setCantidad] = useState<number>(1);

  const incrementar = () => {
    setCantidad((prev) => prev + 1);
  };

  const decrementar = () => {
    setCantidad((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const totalPuntos = cantidad * beneficio.valor;

  const handleCanjear = async () => {
    const result = await Swal.fire({
      title: '¿Confirmar canje?',
      html: `
        <p><strong>${beneficio.titulo}</strong></p>
        <p>Cantidad: <strong>${cantidad}</strong></p>
        <p>Total a canjear: <strong>${totalPuntos} pts</strong></p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, canjear',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      // 🔗 backend más adelante
      await Swal.fire({
        icon: 'success',
        title: 'Canje realizado',
        text: 'El beneficio fue canjeado correctamente',
      });

      onClose();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* HEADER */}
        <header className={styles.header}>
          <h3 className={styles.title}>{beneficio.titulo}</h3>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        {/* CONTENT */}
        <div className={styles.content}>
          <p className={styles.description}>{beneficio.detalle}</p>

          <div className={styles.stock}>
            Puntos por unidad: <strong>{beneficio.valor} pts</strong>
          </div>

          {/* CONTADOR */}
          <div className={styles.counterContainer}>
            <button
              className={styles.counterButton}
              onClick={decrementar}
            >
              −
            </button>

            <span className={styles.counterValue}>{cantidad}</span>

            <button
              className={styles.counterButton}
              onClick={incrementar}
            >
              +
            </button>
          </div>

          {/* TOTAL */}
          <div className={styles.points}>
            Total a canjear: {totalPuntos} pts
          </div>
        </div>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className={styles.confirmButton}
            onClick={handleCanjear}
          >
            Canjear
          </button>
        </footer>
      </div>
    </div>
  );
}
