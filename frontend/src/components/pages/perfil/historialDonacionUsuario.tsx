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
  const [isEnvioModalOpen, setIsEnvioModalOpen] = useState(false);
  const [isMotivoModalOpen, setIsMotivoModalOpen] = useState(false);
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
        const res = await baseApi.usuario.getDonaciones(page, 6);
        setDonaciones(res.items);
        setTotalPages(Math.ceil(res.total / 6));
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

  const handleOpenEnvioModal = (donacion: donacionUsuario) => {
    setSelectedDonacion(donacion);
    setIsEnvioModalOpen(true);
  };

  const handleOpenMotivoModal = (donacion: donacionUsuario) => {
    setSelectedDonacion(donacion);
    setIsMotivoModalOpen(true);
  };

  const handleCloseMotivoModal = () => {
    setIsMotivoModalOpen(false);
    setSelectedDonacion(null);
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
              {donacion.titulo_campaña}
            </h3>

            <p className={styles.organizacion}>
              Organización:{" "}
              <strong>{donacion.nombre_organizacion}</strong>
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

            {donacion.estado !== DonacionEstado.RECHAZADA && (
            <button
              className={styles.infoButton}
              onClick={() => handleOpenEnvioModal(donacion)}
            >
              Información del envío
            </button>
          )}

            {donacion.motivo_rechazo && (
              <button
                className={styles.motivoButton}
                onClick={() => handleOpenMotivoModal(donacion)}
              >
                Ver motivo
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal de ENVÍO (tu componente original) */}
      <EnviosInfo
        isOpen={isEnvioModalOpen}
        onClose={() => setIsEnvioModalOpen(false)}
        donacion={selectedDonacion}
      />

      {/* Modal de MOTIVO */}
      {isMotivoModalOpen && selectedDonacion && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Motivo:</h3>
            <p className={styles.modalText}>
              {selectedDonacion.motivo_rechazo}
            </p>

            <button
              className={styles.closeButton}
              onClick={handleCloseMotivoModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

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