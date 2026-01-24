"use client";

import { Badge } from "@/components/ui/badge";
import styles from "@/styles/historialDonaciones.module.css";

/* ===============================
   TIPOS
================================ */
type DonacionUsuario = {
  id: string;
  fecha: string;
  producto: string;
  organizacion: string;
  estado: "Rechazado" | "Confirmado" | "En proceso";
};

/* ===============================
   MOCK
================================ */
const mockDonaciones: DonacionUsuario[] = [
  {
    id: "1",
    fecha: "10/01/2026",
    producto: "Ropa de abrigo",
    organizacion: "Fundación Abrigar",
    estado: "Confirmado",
  },
  {
    id: "2",
    fecha: "18/01/2026",
    producto: "Alimentos no perecederos",
    organizacion: "Banco de Alimentos",
    estado: "En proceso",
  },
  {
    id: "3",
    fecha: "22/01/2026",
    producto: "Útiles escolares",
    organizacion: "Manos Solidarias",
    estado: "Rechazado",
  },
];

/* ===============================
   COMPONENTE
================================ */
export default function HistorialDonacionUsuario() {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Historial de donaciones</h2>

      <div className={styles.grid}>
        {mockDonaciones.map((donacion) => (
          <div key={donacion.id} className={styles.card}>
            <p className={styles.fecha}>{donacion.fecha}</p>

            <h3 className={styles.producto}>{donacion.producto}</h3>

            <p className={styles.organizacion}>
              Organización: <strong>{donacion.organizacion}</strong>
            </p>

            <div className={styles.estado}>
              <Badge
                className={
                  donacion.estado === "Confirmado"
                    ? styles.badgeSuccess
                    : donacion.estado === "En proceso"
                    ? styles.badgeWarning
                    : styles.badgeDanger
                }
              >
                {donacion.estado}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
