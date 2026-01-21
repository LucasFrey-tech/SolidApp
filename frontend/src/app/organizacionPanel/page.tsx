"use client";

import { useEffect, useState } from "react";
import { Edit2 } from "lucide-react";
import Swal from "sweetalert2";
import styles from "@/styles/organizationPanel.module.css";
import formStyles from "@/styles/campaignPanel.module.css";
import { CampaignForm } from "./CampainForm";

/* ===============================
   TIPOS
================================ */
type Campaign = {
  id: string;
  titulo: string;
  descripcion: string;
  objetivo: number;
};

type Donation = {
  id: string;
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

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);

  const [open, setOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] =
    useState<Campaign | null>(null);

  /* ===============================
     DATOS MOCK
  ================================ */
  useEffect(() => {
    setCampaigns([
      {
        id: "1",
        titulo: "Campaña 1",
        descripcion: "Descripción 1",
        objetivo: 100,
      },
      {
        id: "2",
        titulo: "Campaña 2",
        descripcion: "Descripción 2",
        objetivo: 200,
      },
    ]);

    setDonations([
      {
        id: "1",
        user: "Juan Pérez",
        description: "Donó ropa",
        points: 150,
      },
      {
        id: "2",
        user: "María López",
        description: "Donó alimentos",
        points: 300,
      },
    ]);
  }, []);

  /* ===============================
     CAMPAÑAS
  ================================ */
  const handleSaveCampaign = (data: Partial<Campaign>) => {
    if (editingCampaign) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === editingCampaign.id ? { ...c, ...data } : c
        )
      );
    } else {
      setCampaigns((prev) => [
        ...prev,
        {
          id: (prev.length + 1).toString(),
          titulo: data.titulo!,
          descripcion: data.descripcion!,
          objetivo: data.objetivo!,
        },
      ]);
    }

    setEditingCampaign(null);
    setOpen(false);
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
        setDonations((prev) =>
          prev.filter((d) => d.id !== donation.id)
        );
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
        setDonations((prev) =>
          prev.filter((d) => d.id !== donation.id)
        );
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
                <strong>{c.titulo}</strong> — {c.descripcion} —
                Objetivo: {c.objetivo}
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
        <div
          className={formStyles.modalOverlay}
          onClick={() => setOpen(false)}
        >
          <div
            className={formStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <CampaignForm
              campaign={editingCampaign || undefined}
              onClose={() => {
                setOpen(false);
                setEditingCampaign(null);
              }}
              onSuccess={handleSaveCampaign}
            />
          </div>
        </div>
      )}
    </div>
  );
}
