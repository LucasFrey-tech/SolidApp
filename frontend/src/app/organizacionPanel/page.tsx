"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit2 } from "lucide-react";
import Swal from "sweetalert2";
import styles from "@/styles/Paneles/organizationPanel.module.css";
import { CampaignForm, CampaignFormValues } from "./CampainForm";
import { BaseApi } from "@/API/baseApi";
import { useUser } from "../context/UserContext";
import Modal from "@/components/ui/Modal";

import {
  Campaign,
  CampaignCreateRequest,
  CampaignUpdateRequest,
} from "@/API/types/campañas/campaigns";

type Donation = {
  id: number;
  descripcion: string;
  puntos: number;
  userId: number;
  correo: string;
  campaignId: number;
  campaignTitulo: string;
};

type ViewMode = "campaigns" | "donations";

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
  const [editingCampaign, setEditingCampaign] =
    useState<Campaign | null>(null);

  const api = useMemo(() => new BaseApi(), []);

  /* ===============================
     CAMPAÑAS
  ================================ */

  const fetchCampaigns = async () => {
    if (!organizacionId) return;

    const limit = 8;

    const response =
      await api.organizacion.getOrganizationCampaignsPaginated(
        organizacionId,
        campaignsPage,
        limit
      );

    const totalPages = Math.max(1, Math.ceil(response.total / limit));

    setCampaigns(response.items);
    setCampaignsTotalPages(totalPages);

    if (campaignsPage > totalPages) {
      setCampaignsPage(totalPages);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [organizacionId, campaignsPage]);

  /* ===============================
     DONACIONES
  ================================ */

  const fetchDonations = async () => {
    if (!organizacionId) return;

    const limit = 8;

    const response =
      await api.organizacion.getDonationsPaginatedByOrganizacion(
        organizacionId,
        donationsPage,
        limit
      );

    setDonations(response.items);
    setDonationsTotalPages(Math.ceil(response.total / limit));
  };

  useEffect(() => {
    if (view === "donations") {
      fetchDonations();
    }
  }, [organizacionId, donationsPage, view]);

  const handleAcceptDonation = (donation: Donation) => {
    Swal.fire({
      title: "¿Aceptar donación?",
      text: `${donation.correo} - ${donation.id}`,
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

  const handleRejectDonation = async (donation: Donation) => {
    const confirm = await Swal.fire({
      title: "¿Rechazar donación?",
      text: "¿Estás seguro que querés rechazar esta donación?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    const { value: reason } = await Swal.fire({
      title: "Motivo del rechazo",
      input: "textarea",
      inputLabel: "Por favor, escribí el motivo",
      inputPlaceholder: "Escribí el motivo del rechazo...",
      inputAttributes: {
        maxlength: "300",
      },
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value || value.trim().length === 0) {
          return "Tenés que escribir un motivo";
        }
        return null;
      },
    });

    if (!reason) return;

    try {
      // LLamar API de rechazo de donación.

      await Swal.fire(
        "Rechazada",
        "La donación fue rechazada correctamente",
        "success"
      );

      setDonations((prev) => prev.filter((d) => d.id !== donation.id));
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo rechazar la donación", "error");
    }
  };

  /* ===============================
     CREAR / EDITAR CAMPAÑA
  ================================ */

  const handleSubmitCampaign = async (data: CampaignFormValues) => {
    if (!organizacionId) return;

    try {
      const files = data.imagenes ?? [];

      if (editingCampaign) {
        const updateData: CampaignUpdateRequest = {
          titulo: data.titulo,
          descripcion: data.descripcion,
          objetivo: data.objetivo,
          puntos: data.puntos,
          fecha_Inicio: data.fecha_Inicio,
          fecha_Fin: data.fecha_Fin,
          estado: data.estado,
        };

        await api.campaign.update(editingCampaign.id, updateData, files);

        Swal.fire("Actualizada", "Campaña actualizada con éxito", "success");
      } else {
        const createData: CampaignCreateRequest = {
          titulo: data.titulo,
          descripcion: data.descripcion,
          objetivo: data.objetivo,
          puntos: data.puntos,
          fecha_Inicio: data.fecha_Inicio,
          fecha_Fin: data.fecha_Fin,
          id_organizacion: organizacionId,
        };

        await api.campaign.create(createData, files);

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
     RENDER
  ================================ */

  return (
    <div className={styles.container}>
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

      {view === "campaigns" && (
        <>
          <ul className={styles.list}>
            {campaigns.map((c) => (
              <li key={c.id} className={styles.card}>
                <div>
                  <strong>{c.titulo}</strong> — {c.descripcion} — <strong>Objetivo:{" "}
                  {c.objetivo}</strong> - <strong>Puntos por donacion: {c.puntos}</strong> - Estado: {c.estado}
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

          <div className={styles.pagination}>
            <button
              disabled={campaignsPage === 1}
              onClick={() => setCampaignsPage((p) => p - 1)}
            >
              Anterior
            </button>

            <span>
              Página {campaignsPage} de {campaignsTotalPages}
            </span>

            <button
              disabled={campaignsPage === campaignsTotalPages}
              onClick={() => setCampaignsPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {view === "donations" && (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Campaña</th>
                <th>Usuario</th>
                <th>Donación</th>
                <th>Puntos</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {donations.map((d) => (
                <tr key={d.id}>
                  <td>{d.campaignTitulo}</td>
                  <td>{d.correo}</td>
                  <td>{d.descripcion}</td>
                  <td>{d.puntos}</td>
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

          <div className={styles.pagination}>
            <button
              disabled={donationsPage === 1}
              onClick={() => setDonationsPage((p) => p - 1)}
            >
              Anterior
            </button>

            <span>
              Página {donationsPage} de {donationsTotalPages}
            </span>

            <button
              disabled={donationsPage === donationsTotalPages}
              onClick={() => setDonationsPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingCampaign(null);
        }}
      >
        <CampaignForm
          initialValues={editingCampaign ?? undefined}
          onSubmit={handleSubmitCampaign}
          onCancel={() => {
            setOpen(false);
            setEditingCampaign(null);
          }}
        />
      </Modal>
    </div>
  );
}
