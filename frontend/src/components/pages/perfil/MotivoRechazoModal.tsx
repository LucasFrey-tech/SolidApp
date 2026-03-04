"use client";

import styles from "@/styles/UserPanel/usuario/motivoRechazo.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  motivo: string | null | undefined;
}

export default function MotivoRechazoModal({
  isOpen,
  onClose,
  motivo,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.title}>Motivo</h3>

        <p className={styles.motivoText}>
          {motivo || "No se especificó un motivo."}
        </p>

        <button className={styles.closeButton} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}