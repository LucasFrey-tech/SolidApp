"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { donacionUsuario } from "@/API/types/donaciones/donaciones";
import { useUser } from "@/app/context/UserContext";
import { baseApi } from "@/API/baseApi";
import { DonacionEstado } from "@/API/types/donaciones/enum";
import EnviosInfo from "./enviosInfo";
import styles from "@/styles/UserPanel/usuario/historialDonaciones.module.css";

export default function HistorialDonacionUsuario() {
  const [donaciones, setDonaciones] = useState<donacionUsuario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDonacion, setSelectedDonacion] =
    useState<donacionUsuario | null>(null);
  const [page, setPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const fetchDonaciones = async () => {
      setLoading(true);
      try {
        const res = await baseApi.users.getDonaciones(page, 10);
        setDonaciones(res.items);
        setTotalPages(Math.ceil(res.total / 10));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchDonaciones();
  }, [user, page]);

  if (loading) return <p>Cargando donaciones...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleOpenModal = (donacion: donacionUsuario) => {
    setSelectedDonacion(donacion);
    setIsModalOpen(true);
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Historial de donaciones</h2>

      <div className={styles.grid}>
        {donaciones.map((donacion) => (
          <div key={donacion.id} className={styles.card}>
            <p className={styles.fecha}>
              {new Date(donacion.fecha_registro).toLocaleDateString()}
            </p>

            <h3 className={styles.producto}>
              {donacion.tituloCampaña}
            </h3>

            <p className={styles.organizacion}>
              Organización:{" "}
              <strong>{donacion.nombreOrganizacion}</strong>
            </p>


            <div className={styles.estado}>
              Estado: 
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
            </div>

            <button
              className={styles.infoButton}
              onClick={() => handleOpenModal(donacion)}
            >
              Información del envío
            </button>
          </div>
        ))}
      </div>

      <EnviosInfo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        donacion={selectedDonacion}
      />

      <div className={styles.pagination}>
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Anterior
        </button>

        <span>
          Página {page} de {TotalPages}
        </span>

        <button
          disabled={page === TotalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}