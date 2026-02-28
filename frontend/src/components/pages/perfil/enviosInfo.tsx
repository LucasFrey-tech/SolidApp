"use client";

import { donacionUsuario } from "@/API/types/donaciones/donaciones";
import styles from "@/styles/UserPanel/usuario/enviosInfo.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  donacion: donacionUsuario | null;
}

export default function EnviosInfo({
  isOpen,
  onClose,
  donacion,
}: Props) {
  if (!isOpen || !donacion) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.title}>Datos de envío</h2>

        <div className={styles.separator}></div>

        <p className={styles.datosLabel}>
          <strong className={styles.datos}>Organización:</strong> {donacion.nombre_organizacion}
        </p>

        <p className={styles.datosLabel}>
          <strong className={styles.datos}>Dirección:</strong> {donacion.calle + " " + donacion.numero }
        </p>

        <p className={styles.datosLabel}>
          <strong className={styles.datos}>Campaña:</strong> {donacion.titulo_campaña}
        </p>

        <p className={styles.datosLabel}>
          <strong className={styles.datos}>Cantidad donada:</strong> {donacion.cantidad}
        </p>
        <p className={styles.datosLabel}>
          <strong className={styles.datos}>Detalle donado:</strong> {donacion.detalle}
        </p>

        <div className={styles.actions}>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}