"use client";

import { useEffect, useState } from "react";
import { Edit2 } from "lucide-react";
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

  const [open, setOpen] = useState(false);

  // 🔥 CORRECTO: ahora es CampaignDetalle
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

        await baseApi.campaign.update(editingCampaign.id, updateData, files);

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
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo guardar la campaña", "error");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Panel de Organización</h2>

        <button
          className={styles.button}
          onClick={() => {
            setEditingCampaign(null);
            setOpen(true);
          }}
        >
          Agregar campaña
        </button>
      </div>

      <div className={styles.divider} />

      <ul className={styles.list}>
        {campaigns.map((c) => (
          <li key={c.id} className={styles.card}>
            <div>
              <strong>{c.titulo}</strong> — {c.descripcion} —{" "}
              <strong>Objetivo: {c.objetivo}</strong> -{" "}
              <strong>Puntos: {c.puntos}</strong> - Estado:{" "}
              <span
                style={{
                  color: getStatusColor(c.estado),
                  fontWeight: "bold",
                }}
              >
                {c.estado}
              </span>
            </div>

            {/* 🔥 TRAEMOS EL DETALLE REAL */}
            <Edit2
              className={styles.editIcon}
              onClick={async () => {
                try {
                    const detalle = await baseApi.campaign.getOneDetail(c.id);

                  setEditingCampaign(detalle);
                  setOpen(true);
                } catch (error) {
                  console.error(error);
                }
              }}
            />
          </li>
        ))}
      </ul>

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