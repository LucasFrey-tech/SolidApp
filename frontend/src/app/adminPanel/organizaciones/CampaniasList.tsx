"use client";

import { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "@/styles/Paneles/adminUsersPanel.module.css";
import { baseApi } from "@/API/baseApi";

import { Campaign } from "@/API/types/campañas/campaigns";
import { CampaignEstado } from "@/API/types/campañas/enum";

const PAGE_SIZE = 5;

export default function CampaniasList() {
  const [page, setPage] = useState(1);
  const [campanias, setCampanias] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [campaniasCount, setCampaniasCount] = useState(0);

  /* ===============================
     FETCH
  ================================ */
  useEffect(() => {
    async function fetchCampanias() {
      setLoading(true);

      try {
        const res = await baseApi.campaign.getAllPaginated(page, PAGE_SIZE, undefined, false);

        setCampanias(res.items || []);
        setCampaniasCount(res.total || 0);
      } catch (error) {
        console.error("Error del fetch", error);

        Swal.fire({
          icon: "error",
          title: "Error al cargar campañas",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCampanias();
  }, [page]);

  /* ===============================
     BUSCADOR
  ================================ */
  const campaniasFiltradas = useMemo(() => {
    if (!search.trim()) return campanias;

    const searchLower = search.toLowerCase();

    return campanias.filter(
      (camp) =>
        camp.titulo.toLowerCase().includes(searchLower) ||
        camp.organizacion.nombre_organizacion
          .toLowerCase()
          .includes(searchLower) ||
        camp.organizacion.id.toString().includes(searchLower),
    );
  }, [campanias, search]);

  const totalPages = Math.ceil(campaniasCount / PAGE_SIZE) || 1;

  /* ===============================
     UPDATE ESTADO REAL EN DB
  ================================ */
  const updateEstado = async (camp: Campaign, nuevoEstado: CampaignEstado) => {
    const confirm = await Swal.fire({
      title:
        nuevoEstado === CampaignEstado.ACTIVA
          ? "¿Habilitar campaña?"
          : "¿Deshabilitar campaña?",
      text: `${camp.titulo} (${camp.organizacion.nombre_organizacion})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await baseApi.campaign.updateEstado(camp.id, 
        nuevoEstado,
      );

      setCampanias((prev) =>
        prev.map((c) => (c.id === camp.id ? { ...c, estado: nuevoEstado } : c)),
      );

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
      });
    }
  };

  const activarCampania = (camp: Campaign) =>
    updateEstado(camp, CampaignEstado.ACTIVA);

  const desactivarCampania = (camp: Campaign) =>
    updateEstado(camp, CampaignEstado.RECHAZADA);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Campañas</h2>

      <input
        type="text"
        className={styles.Search}
        placeholder="Buscar campaña o organización..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {loading ? (
        <p className={styles.Empty}>Cargando...</p>
      ) : campaniasFiltradas.length === 0 ? (
        <p className={styles.Empty}>No se encontraron campañas</p>
      ) : (
        campaniasFiltradas.map((camp) => (
          <div key={camp.id} className={styles.UserRow}>
            <div>
              <strong>{camp.titulo}</strong>

              <div className={styles.Email}>
                Org: {camp.organizacion.nombre_organizacion} (ID{" "}
                {camp.organizacion.id})
              </div>

              <div className={styles.Email} style={{ color: "white" }}>
                Objetivo: {camp.objetivo.toLocaleString()} puntos
              </div>
            </div>

            <div className={styles.Actions}>
              {/* ACTIVAR */}
              <button
                className={styles.Check}
                disabled={camp.estado === CampaignEstado.ACTIVA}
                onClick={() => activarCampania(camp)}
                title="Habilitar campaña"
              >
                ✓
              </button>

              {/* DESACTIVAR */}
              <button
                className={styles.Cross}
                disabled={camp.estado !== CampaignEstado.ACTIVA}
                onClick={() => desactivarCampania(camp)}
                title="Deshabilitar campaña"
              >
                ✕
              </button>
            </div>
          </div>
        ))
      )}

      {/* PAGINACIÓN */}
      <div className={styles.Pagination}>
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Anterior
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
