"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit2 } from "lucide-react";
import Swal from "sweetalert2";
import styles from "@/styles/organizationPanel.module.css";
import formStyles from "@/styles/campaignPanel.module.css";
import { CampaignForm } from "./CampainForm";
import { BaseApi } from "@/API/baseApi";
import { useUser } from "../context/UserContext";
import { CampaignEstado } from "@/API/types/campañas/enum";

/* ===============================
   TIPOS
================================ */
type Campaign = {
  id: number;
  titulo: string;
  descripcion: string;
  objetivo: number;

  fecha_Inicio: string;
  fecha_Fin: string;

  fecha_Registro: string;
  estado?: CampaignEstado;
};

export type CampaignFormValues = {
  titulo: string;
  descripcion: string;
  objetivo: number;
  fecha_Inicio: string;
  fecha_Fin: string;
  estado?: CampaignEstado;
};

type Donation = {
  id: number;
  user: string;
  description: string;
  points: number;
};

type ViewMode = "campaigns" | "donations";

/* ===============================
   COMPONENTE
================================ */
export default function OrganizationCampaignsPage() {
  const [view, setView] = useState<ViewMode>("campaigns");

  const { user } = useUser();
  const organizacionId = user?.sub;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsPage, setCampaignsPage] = useState(1);
  const [campaignsTotalPages, setCampaignsTotalPages] = useState(1);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationsPage, setDonationsPage] = useState(1);
  const [donationsTotalPages, setDonationsTotalPages] = useState(1);

  const [open, setOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const api = useMemo(() => new BaseApi(), []);

  /* ===============================
     CAMPAÑAS PÁGINADAS
  ================================ */
  const fetchCampaigns = async () => {
    if (!organizacionId) return;

    const response = await api.organizacion.getOrganizationCampaignsPaginated(
      organizacionId,
      campaignsPage,
      8,
    );
    setCampaigns(response.items);
    setCampaignsTotalPages(response.totalPages);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [organizacionId, campaignsPage]);

  /* ===============================
     HELPERS
  ================================ */
  const toFormValues = (campaign: Campaign): CampaignFormValues => ({
    titulo: campaign.titulo,
    descripcion: campaign.descripcion,
    objetivo: campaign.objetivo,
    fecha_Inicio: campaign.fecha_Inicio,
    fecha_Fin: campaign.fecha_Fin,
  });

  /* ===============================
     CREAR O ACTUALIZAR CAMPAÑAS
  ================================ */
  const handleSubmitCampaign = async (data: CampaignFormValues) => {
    if (!organizacionId) return;

    try {
      if (editingCampaign) {
        await api.campaign.update(editingCampaign.id, {
          titulo: data.titulo,
          descripcion: data.descripcion,
          objetivo: data.objetivo,
          fecha_Inicio: data.fecha_Inicio,
          fecha_Fin: data.fecha_Fin,
          estado: data.estado,
        });

        Swal.fire("Actualizada", "Campaña actualizada con éxito", "success");
      } else {
        await api.campaign.create({
          titulo: data.titulo,
          descripcion: data.descripcion,
          objetivo: data.objetivo,
          fecha_Inicio: data.fecha_Inicio,
          fecha_Fin: data.fecha_Fin,
          id_organizacion: organizacionId,
        });

        Swal.fire("Creada", "Campaña creada con éxito", "success");
      }

      setOpen(false);
      setEditingCampaign(null);
      fetchCampaigns();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo guardar la campaña", "error");
    }
  };

  /* ===============================
     DONACIONES
  ================================ */
  const handleAcceptDonation = (donation: Donation) => {
    Swal.fire({
      title: "¿Aceptar donación?",
      text: `${donation.user} - ${donation.description}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        Swal.fire("Aceptada", "La donación fue aceptada", "success");
        setDonations((prev) => prev.filter((d) => d.id !== donation.id));
      }
    });
  };

  const handleRejectDonation = (donation: Donation) => {
    Swal.fire({
      title: "¿Rechazar donación?",
      text: "¿Estás seguro que querés rechazar esta donación?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        Swal.fire("Rechazada", "La donación fue rechazada", "error");
        setDonations((prev) => prev.filter((d) => d.id !== donation.id));
      }
    });
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <h2>Panel de Organización</h2>

        {view === "campaigns" && (
          <button
            className={styles.button}
            onClick={() => {
              setEditingCampaign(null);
              setOpen(true);
            }}
          >
            Agregar campaña
          </button>
        )}
      </div>

      {/* TABS */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            view === "campaigns" ? styles.active : ""
          }`}
          onClick={() => setView("campaigns")}
        >
          Campañas
        </button>

        <button
          className={`${styles.tabButton} ${
            view === "donations" ? styles.active : ""
          }`}
          onClick={() => setView("donations")}
        >
          Donaciones
        </button>
      </div>

      <div className={styles.divider} />

      {/* ===============================
          CAMPAÑAS
      ================================ */}
      {view === "campaigns" && (
        <ul className={styles.list}>
          {campaigns.map((c) => (
            <li key={c.id} className={styles.card}>
              <div>
                <strong>{c.titulo}</strong> — {c.descripcion} — Objetivo:{" "}
                {c.objetivo} - Estado: {c.estado}
              </div>
              <Edit2
                className={styles.editIcon}
                onClick={() => {
                  setEditingCampaign(c);
                  setOpen(true);
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {/* ===============================
          DONACIONES (HORIZONTAL)
      ================================ */}
      {view === "donations" && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Donación</th>
              <th>Puntos</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {donations.map((d) => (
              <tr key={d.id}>
                <td>{d.user}</td>
                <td>{d.description}</td>
                <td>{d.points}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.accept}
                      onClick={() => handleAcceptDonation(d)}
                    >
                      ✔
                    </button>
                    <button
                      className={styles.reject}
                      onClick={() => handleRejectDonation(d)}
                    >
                      ✖
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ===============================
          MODAL
      ================================ */}
      {open && (
        <div className={formStyles.modalOverlay} onClick={() => setOpen(false)}>
          <div
            className={formStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <CampaignForm
              initialValues={editingCampaign
                ? toFormValues(editingCampaign)
                : undefined
              }
              onSubmit={handleSubmitCampaign}
              onCancel={() => {
                setOpen(false);
                setEditingCampaign(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
