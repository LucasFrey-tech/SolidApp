"use client";

import { useEffect, useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import Swal from "sweetalert2";
import styles from "@/styles/Paneles/organizationPanel.module.css";
import { CampaignForm, CampaignFormValues } from "./CampainForm";
import { baseApi } from "@/API/baseApi";
import { useUser } from "../context/UserContext";
import Modal from "@/components/ui/Modal";
import { DonacionEstado } from "@/API/types/donaciones/enum";

import {
  Campaign,
  CampaignCreateRequest,
  CampaignUpdateRequest,
  CampaignDetalle,
} from "@/API/types/campañas/campaigns";

type Donation = {
  id: number;
  descripcion: string;
  puntos: number;
  userId: number;
  correo: string;
  campaignId: number;
  campaignTitulo: string;
  estado: DonacionEstado;
  fecha_estado?: string;
  cantidad: number;
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
    useState<CampaignDetalle | null>(null);

  /* ===============================
     COLORES DE ESTADO
  ================================ */

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "activa":
        return "#22c55e";
      case "pendiente":
        return "#facc15";
      case "rechazada":
        return "#ef4444";
      case "finalizada":
        return "#f97316";
      default:
        return "#6b7280";
    }
  };

  /* ===============================
     CAMPAÑAS
  ================================ */

  const fetchCampaigns = async () => {
    if (!organizacionId) return;

    const limit = 8;

    const response =
      await baseApi.campaign.getCampaignsPaginatedByOrganizacion(
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

  const fetchDonations = async () => {
    if (!organizacionId) return;

    const limit = 8;

    const response =
      await baseApi.donation.getAllPaginatedByOrganizacion(
        organizacionId,
        donationsPage,
        limit
      );

    setDonations(
      response.items.map((item) => ({
        ...item,
        estado: item.estado as DonacionEstado,
      }))
    );

    setDonationsTotalPages(Math.max(1, Math.ceil(response.total / limit)));
  };

  useEffect(() => {
    if (view === "donations") {
      fetchDonations();
    }
  }, [organizacionId, donationsPage, view]);

  const handleAcceptDonation = async (donation: Donation) => {
    const res = await Swal.fire({
      title: "¿Aceptar donación?",
      text: `${donation.correo} - ${donation.id}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
    });

    if (!res.isConfirmed) return;

    try {
      await baseApi.donation.updateDonationStatus(donation.id, {
        estado: DonacionEstado.APROBADA,
      });

      await Swal.fire("Aceptada", "La donación fue aceptada", "success");

      setDonations((prev) =>
        prev.map((d) =>
          d.id === donation.id
            ? { ...d, estado: DonacionEstado.APROBADA }
            : d
        )
      );

      await fetchCampaigns();
    } catch {
      Swal.fire("Error", "No se pudo aceptar la donación", "error");
    }
  };

  const handleRejectDonation = async (donation: Donation) => {
    const confirm = await Swal.fire({
      title: "¿Rechazar donación?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    const { value: reason } = await Swal.fire({
      title: "Motivo del rechazo",
      input: "textarea",
      showCancelButton: true,
      inputValidator: (value) =>
        !value || value.trim().length === 0
          ? "Tenés que escribir un motivo"
          : undefined,
    });

    if (!reason) return;

    try {
      await baseApi.donation.updateDonationStatus(donation.id, {
        estado: DonacionEstado.RECHAZADA,
        motivo: reason,
      });

      await Swal.fire("Rechazada", "Donación rechazada", "success");

      setDonations((prev) =>
        prev.map((d) =>
          d.id === donation.id
            ? { ...d, estado: DonacionEstado.RECHAZADA }
            : d
        )
      );
    } catch {
      Swal.fire("Error", "No se pudo rechazar la donación", "error");
    }
  };

  const puedeAceptar = (donacion: Donation) => {
    if (donacion.estado === DonacionEstado.PENDIENTE) return true;
    if (donacion.estado === DonacionEstado.APROBADA) return false;

    if (
      donacion.estado === DonacionEstado.RECHAZADA &&
      donacion.fecha_estado
    ) {
      const fecha = new Date(donacion.fecha_estado);
      const horas =
        (Date.now() - fecha.getTime()) / (1000 * 60 * 60);
      return horas <= 48;
    }

    return false;
  };

  /* ===============================
     CREAR / EDITAR
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

        await baseApi.campaign.update(editingCampaign.id, updateData, files, data.imagenesExistentes);

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

        await baseApi.campaign.create(createData, files);

        Swal.fire("Creada", "Campaña creada con éxito", "success");
      }

      setOpen(false);
      setEditingCampaign(null);
      fetchCampaigns();
    } catch {
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
          className={`${styles.tabButton} ${view === "campaigns" ? styles.active : ""
            }`}
          onClick={() => setView("campaigns")}
        >
          Campañas
        </button>

        <button
          className={`${styles.tabButton} ${view === "donations" ? styles.active : ""
            }`}
          onClick={() => setView("donations")}
        >
          Donaciones
        </button>
      </div>

      <div className={styles.divider} />

      {/* CAMPAÑAS */}
      {view === "campaigns" && (
        <>
          <ul className={styles.list}>
            {campaigns.map((c) => (
              <li key={c.id} className={styles.card}>
                <div>
                  <strong>{c.titulo}</strong> — {c.descripcion} —{" "}
                  <strong>Objetivo: {c.objetivo}</strong> —{" "}
                  <strong>Puntos: {c.puntos}</strong> — Estado:{" "}
                  <span
                    style={{
                      color: getStatusColor(c.estado),
                      fontWeight: "bold",
                    }}
                  >
                    {c.estado}
                  </span>
                </div>

                <Edit2
                  className={styles.editIcon}
                  onClick={async () => {
                    const detalle =
                      await baseApi.campaign.getOneDetail(c.id);
                    setEditingCampaign(detalle);
                    setOpen(true);
                  }}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {/* DONACIONES (se mantiene completo) */}
      {view === "donations" && (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Campaña</th>
                <th>Usuario</th>
                <th>Donación</th>
                <th>Cantidad</th>
                <th>Puntos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id}>
                  <td>{d.campaignTitulo}</td>
                  <td>{d.correo}</td>
                  <td>{d.descripcion}</td>
                  <td>{d.cantidad}</td>
                  <td>{d.puntos}</td>
                  <td>{DonacionEstado[d.estado]}</td>
                  <td>
                    <button
                      disabled={!puedeAceptar(d)}
                      onClick={() => handleAcceptDonation(d)}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      disabled={d.estado !== DonacionEstado.PENDIENTE}
                      onClick={() => handleRejectDonation(d)}
                    >
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          initialValues={
            editingCampaign
              ? {
                titulo: editingCampaign.titulo,
                descripcion: editingCampaign.descripcion,
                objetivo: editingCampaign.objetivo,
                puntos: editingCampaign.puntos,
                fecha_Inicio: editingCampaign.fecha_Inicio,
                fecha_Fin: editingCampaign.fecha_Fin,
                estado: editingCampaign.estado,
                imagenesExistentes:
                  editingCampaign.imagenes?.map((img) => img.url) ?? [],
              }
              : undefined
          }
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