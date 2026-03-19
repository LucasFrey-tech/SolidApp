"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import styles from "@/styles/Paneles/organizationPanel.module.css";
import { Invitacion } from "@/API/types/invitaciones/invitaciones";
import InvitarUsuariosModal from "./InvitarUsuariosModal";

export interface InvitacionesService {
  getInvitaciones(entidadId: number): Promise<{ items: Invitacion[]; total: number }>;
  crearInvitaciones(entidadId: number, correos: string[]): Promise<{ correosExistentes: string[] }>;
}

type Props = {
  entidadId?: number;
  service: InvitacionesService;
};

export default function InvitacionesPanel({ entidadId, service }: Props) {
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [openModal, setOpenModal] = useState(false);

  /* ===============================
     FUNCIONES DE ESTADO
  ================================ */
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "#eab308";
      case "expirada":
        return "#ef4444";
      case "usada":
        return "#22c55e";
      default:
        return "#6b7280";
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente";
      case "expirada":
        return "Expirada";
      case "usada":
        return "Aceptada";
      default:
        return estado;
    }
  };

  /* ===============================
     OBTENER INVITACIONES
  ================================ */
  const fetchInvitaciones = async () => {
    const idParaService = entidadId ?? 0;
    try {
      const response = await service.getInvitaciones(idParaService);
      setInvitaciones(response.items);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar las invitaciones", "error");
    }
  };

  useEffect(() => {
    fetchInvitaciones();
  }, [entidadId]);

  /* ===============================
     ENVIAR INVITACIONES
  ================================ */
  const handleEnviarInvitaciones = async (emails: string[]) => {
    const idParaService = entidadId ?? 0;

    const correosValidos = emails.filter((i) => i && i.includes("@"));
    if (correosValidos.length === 0) {
      Swal.fire("Error", "Debes ingresar al menos un correo válido", "error");
      return;
    }

    try {
      const response = await service.crearInvitaciones(idParaService, correosValidos);
      if (response.correosExistentes.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Algunos usuarios ya están registrados",
          text: `No se enviaron invitaciones a: ${response.correosExistentes.join(", ")}`,
        });
      } else {
        Swal.fire(
          "Invitaciones enviadas",
          "Los usuarios recibirán un correo de invitación",
          "success"
        );
      }
      setOpenModal(false);
      fetchInvitaciones();
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.message || "No se pudo enviar la invitación",
        "error"
      );
    }
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Invitaciones</h2>

        <button
          className={styles.button}
          onClick={() => setOpenModal(true)}
        >
          Invitar usuarios
        </button>
      </div>

      <table className={styles.table} style={{ marginTop: "1.5rem" }}>
        <thead>
          <tr>
            <th>Correo</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {invitaciones.length === 0 && (
            <tr>
              <td colSpan={2} style={{ textAlign: "center" }}>
                No hay invitaciones todavía
              </td>
            </tr>
          )}

          {invitaciones.map((i) => (
            <tr key={i.id}>
              <td>{i.correo}</td>
              <td>
                <span
                  style={{
                    color: getEstadoColor(i.estado),
                    fontWeight: "bold",
                  }}
                >
                  {getEstadoLabel(i.estado)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <InvitarUsuariosModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSend={handleEnviarInvitaciones}
      />
    </div>
  );
}