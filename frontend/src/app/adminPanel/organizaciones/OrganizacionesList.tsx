"use client";

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import styles from "@/styles/Paneles/adminUsersPanel.module.css";
import { baseApi } from "@/API/baseApi";

type Organizacion = {
  id: number;
  name: string;
  habilitado: boolean;
};

const PAGE_SIZE = 10;

export default function OrganizacionesList() {
  const [page, setPage] = useState(1);
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchOrganizaciones = async () => {
    setLoading(true);
    try {
      const res = await baseApi.organizacion.getAllPaginated(
        page,
        PAGE_SIZE,
        search,
      );

      console.log("ORGANIZACIONES: ", res);

      const formatted: Organizacion[] = res.items.map((u: any) => ({
        id: u.id,
        name: u.nombre_organizacion,
        habilitado: !u.cuenta?.deshabilitado,
      }));

      setOrganizaciones(formatted);
      setTotalCount(res.total);
    } catch (error) {
      console.error("Error fetch organizaciones:", error);
      Swal.fire("Error", "No se pudieron cargar las organizaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizaciones();
  }, [page, search]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  };

  const toggleOrganizacion = async (org: Organizacion) => {
    const quiereHabilitar = !org.habilitado;
    const title = quiereHabilitar
      ? "¿Habilitar organización?"
      : "¿Deshabilitar organización?";

    const confirmed = await Swal.fire({
      title,
      text: org.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    }).then((res) => res.isConfirmed);

    if (!confirmed) return;

    try {
      if (quiereHabilitar) {
        await baseApi.organizacion.restore(org.id);
      } else {
        await baseApi.organizacion.delete(org.id);
      }

      setOrganizaciones((prev) =>
        prev.map((o) =>
          o.id === org.id ? { ...o, habilitado: quiereHabilitar } : o,
        ),
      );

      Swal.fire({
        icon: "success",
        title: quiereHabilitar ? 'Habilitada' : 'Deshabilitada',
        text: org.name,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Error toggle organización:", error);
      Swal.fire(
        "Error",
        error.message || "No se pudo cambiar el estado",
        "error",
      );
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Organizaciones</h2>

      <input
        type="text"
        className={styles.Search}
        placeholder="Buscar organización..."
        value={searchInput}
        onChange={(e) => handleSearchChange(e.target.value)}
      />

      {loading ? (
        <p className={styles.Empty}>Cargando...</p>
      ) : organizaciones.length === 0 ? (
        <p className={styles.Empty}>No se encontraron organizaciones</p>
      ) : (
        organizaciones.map((org) => (
          <div key={org.id} className={styles.UserRow}>
            <strong>{org.name}</strong>

            <div className={styles.Actions}>
              <button
                className={styles.Check}
                disabled={org.habilitado}
                onClick={() => toggleOrganizacion(org)}
              >
                ✓
              </button>
              <button
                className={styles.Cross}
                disabled={!org.habilitado}
                onClick={() => toggleOrganizacion(org)}
              >
                ✕
              </button>
            </div>
          </div>
        ))
      )}

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
