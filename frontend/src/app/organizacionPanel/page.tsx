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
import { Check, X } from "lucide-react";

import {
  CampaignCreateRequest,
  CampaignDetalle,
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
  estado: DonacionEstado;
  fecha_estado?: string;
  cantidad: number;
};

type ViewMode = "campaigns" | "donations";

export default function OrganizationCampaignsPage() {
  const [view, setView] = useState<ViewMode>("campaigns");

  const { user } = useUser();
  const organizacionId = user?.sub;

  const [campaigns, setCampaigns] = useState<CampaignDetalle[]>([]);
  const [campaignsPage, setCampaignsPage] = useState(1);
  const [campaignsTotalPages, setCampaignsTotalPages] = useState(1);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationsPage, setDonationsPage] = useState(1);
  const [donationsTotalPages, setDonationsTotalPages] = useState(1);

  const [open, setOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] =
    useState<CampaignDetalle | null>(null);

  /* ===============================
     CAMPAÑAS
  ================================ */

  const fetchCampaigns = async () => {
    if (!organizacionId) return;

    const limit = 8;

    const response = await baseApi.organizacion.getCampaignsPaginated(
      campaignsPage,
      limit,
    );

    console.log("Campañas desde backend:", response.items);
    console.log("Primera campaña:", response.items[0]);

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

    const response = await baseApi.organizacion.getAllPaginatedByOrganizacion(
      donationsPage,
      limit,
    );

    console.log("Donaciones desde backend:", response.items);
    console.log("Primera donación:", response.items[0]);

    setDonations(
      response.items.map((item) => ({
        ...item,
        estado: item.estado as DonacionEstado,
      })),
    );

    const totalPages = Math.max(1, Math.ceil(response.total / limit));
    setDonationsTotalPages(totalPages);
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
      await baseApi.organizacion.updateDonationStatus(donation.id, {
        estado: DonacionEstado.APROBADA,
      });

      await Swal.fire("Aceptada", "La donación fue aceptada", "success");

      setDonations((prev) =>
        prev.map((d) =>
          d.id === donation.id ? { ...d, estado: DonacionEstado.APROBADA } : d,
        ),
      );

      await fetchCampaigns();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo aceptar la donación", "error");
    }
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
      },
    });

    if (!reason) return;

    try {
      await baseApi.organizacion.updateDonationStatus(donation.id, {
        estado: DonacionEstado.RECHAZADA,
        motivo: reason,
      });

      await Swal.fire(
        "Rechazada",
        "La donación fue rechazada correctamente",
        "success",
      );

      setDonations((prev) =>
        prev.map((d) =>
          d.id === donation.id ? { ...d, estado: DonacionEstado.RECHAZADA } : d,
        ),
      );
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

        await baseApi.organizacion.updateCampaign(
          editingCampaign.id,
          updateData,
          files,
          data.imagenesExistentes,
        );

        Swal.fire("Actualizada", "Campaña actualizada con éxito", "success");
      } else {
        const createData: CampaignCreateRequest = {
          titulo: data.titulo,
          descripcion: data.descripcion,
          objetivo: data.objetivo,
          puntos: data.puntos,
          fecha_Inicio: data.fecha_Inicio,
          fecha_Fin: data.fecha_Fin,
        };

        await baseApi.organizacion.createCampaign(createData, files);

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

  const puedeAceptar = (donacion: Donation) => {
    if (donacion.estado === DonacionEstado.PENDIENTE) return true;

    if (donacion.estado === DonacionEstado.APROBADA) return false;

    if (!donacion.fecha_estado) return false;

    if (donacion.estado === DonacionEstado.RECHAZADA) {
      const fechaRechazo = new Date(donacion.fecha_estado);
      const ahora = new Date();
      const horasPasadas =
        (ahora.getTime() - fechaRechazo.getTime()) / (1000 * 60 * 60);

      return horasPasadas <= 48;
    }

    return false;
  };

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
                  <strong>{c.titulo}</strong> — {c.descripcion} —{" "}
                  <strong>Objetivo: {c.objetivo}</strong> -{" "}
                  <strong>Puntos por donacion: {c.puntos}</strong> - Estado:{" "}
                  {c.estado}
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

                  <td>
                    <span
                      className={`${styles.badge} ${
                        d.estado === DonacionEstado.APROBADA
                          ? styles.badgeAprobada
                          : d.estado === DonacionEstado.RECHAZADA
                            ? styles.badgeRechazada
                            : styles.badgePendiente
                      }`}
                    >
                      {DonacionEstado[d.estado]}
                    </span>
                  </td>

                  <td className={styles.actions}>
                    <button
                      className={
                        puedeAceptar(d)
                          ? styles.approveButton
                          : styles.disabledButton
                      }
                      disabled={!puedeAceptar(d)}
                      onClick={() => handleAcceptDonation(d)}
                    >
                      <Check size={18} />
                    </button>

                    <button
                      className={
                        d.estado === DonacionEstado.PENDIENTE
                          ? styles.rejectButton
                          : styles.disabledButton
                      }
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

          <div className={styles.pagination}>
            <button
              onClick={() => setDonationsPage((prev) => Math.max(prev - 1, 1))}
              disabled={donationsPage === 1}
            >
              Anterior
            </button>

            <span>
              Página {donationsPage} de {donationsTotalPages}
            </span>

            <button
              onClick={() =>
                setDonationsPage((prev) =>
                  Math.min(prev + 1, donationsTotalPages),
                )
              }
              disabled={donationsPage === donationsTotalPages}
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
