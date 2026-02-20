"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { donacionUsuario } from "@/API/types/donaciones/donaciones";
import { useUser } from "@/app/context/UserContext";
import { baseApi } from "@/API/baseApi";
import { DonacionEstado } from "@/API/types/donaciones/enum";
import styles from "@/styles/UserPanel/usuario/historialDonaciones.module.css";

export default function HistorialDonacionUsuario() {
  const [donacion, setDonacion] = useState<donacionUsuario[]>([]);
  const [donacionesPage, setDonacionesPage] = useState(1);
  const [donacionesTotalPages, setDonacionesTotalPages] = useState(1);

  const { user } = useUser();

  useEffect(() => {
    const fetchDonaciones = async () => {
      if (!user) return;
      const res = await baseApi.donation.getAllPaginatedByUser(
        user?.sub,
        1,
        10,
      );
      setDonacion(res.items);
    };

    fetchDonaciones();
  }, [user]);

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Historial de donaciones</h2>

      <div className={styles.grid}>
        {donacion.map((donacion) => (
          <div key={donacion.id} className={styles.card}>
            <p className={styles.fecha}>
              {new Date(donacion.fecha_registro).toLocaleDateString()}
            </p>

            <h3 className={styles.producto}>{donacion.detalle}</h3>

            <p className={styles.organizacion}>
              Organización: <strong>{donacion.nombreOrganizacion}</strong>
            </p>

            <p className={styles.campaña}>
              Campaña: <strong>{donacion.tituloCampaña}</strong>
            </p>

            <div className={styles.estado}>
              <Badge
                className={
                  donacion.estado === DonacionEstado.APROBADA
                    ? styles.badgeSuccess
                    : donacion.estado === DonacionEstado.PENDIENTE
                      ? styles.badgeWarning
                      : styles.badgeDanger
                }
              >
                {DonacionEstado[donacion.estado]}
              </Badge>

              {donacion.estado === DonacionEstado.RECHAZADA &&
                donacion.motivo_rechazo && (
                  <span className={styles.rejectionReason}>
                    ({donacion.motivo_rechazo})
                  </span>
                )}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.pagination}>
        <button
          disabled={donacionesPage === 1}
          onClick={() => setDonacionesPage((p) => p - 1)}
        >
          Anterior
        </button>

        <span>
          Página {donacionesPage} de {donacionesTotalPages}
        </span>

        <button
          disabled={donacionesPage === donacionesTotalPages}
          onClick={() => setDonacionesPage((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
