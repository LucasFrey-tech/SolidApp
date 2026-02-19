"use client";

import { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "@/styles/Paneles/adminUsersPanel.module.css";
import { baseApi } from "@/API/baseApi";

type Campania = {
  id: number;
  organizationId: number;
  organizationName: string;
  title: string;
  objective: number;
  enabled: boolean;
};

const PAGE_SIZE = 10;

export default function CampaniasList() {

  const [page, setPage] = useState(1);
  const [campanias, setCampanias] = useState<Campania[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [campaniasCount, setCampaniasCount] = useState(0);

  /* ===============================
     FETCH
  ================================ */
  useEffect(() => {
    async function fetchCampanias() {
      setLoading(true);

      try {
        const res = await baseApi.campaign.getAllPaginated(
          page,
          PAGE_SIZE
        );
  
        console.log("RAW RESPONSE:", res);
  
        const campaniasFormated: Campania[] = res.items.map((u: any) => ({
          id: u.id,
          organizationId: u.organizacion.id,
          organizationName: u.organizacion.nombreFantasia,
          title: u.titulo,
          objective: u.objetivo,
          enabled: u.estado === 'ACTIVA',
        }));
  
        setCampanias(campaniasFormated);
        setCampaniasCount(res.total);
      } catch (error) {
        console.error("Error del fetch de campañas", error);
      } finally {
        setLoading(false);
      }

    }

    fetchCampanias();

  }, [page]);

  /* ===============================
     FILTRO BUSCADOR (ACA ESTA LA SOLUCION)
  ================================ */
  const campaniasFiltradas = useMemo(() => {

    if (!search.trim()) return campanias;

    const searchLower = search.toLowerCase();

    return campanias.filter(camp =>
      camp.title.toLowerCase().includes(searchLower) ||
      camp.organizationName.toLowerCase().includes(searchLower) ||
      camp.organizationId.toString().includes(searchLower)
    );

  }, [campanias, search]);

  const totalPages = Math.ceil(campaniasCount / PAGE_SIZE) || 1;

  /* ===============================
     TOGGLE
  ================================ */
  const toggleCampania = (camp: Campania) => {

    Swal.fire({
      title: camp.enabled ? "¿Deshabilitar campaña?" : "¿Habilitar campaña?",
      text: `${camp.title} (${camp.organizationName})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then(res => {

      if (res.isConfirmed) {

        setCampanias(prev =>
          prev.map(c =>
            c.id === camp.id
              ? { ...c, enabled: !c.enabled }
              : c
          )
        );

        Swal.fire({
          icon: "success",
          title: "Actualizado",
          timer: 1200,
          showConfirmButton: false,
        });

      }

    });

  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (

    <div className={styles.UsersBox}>

      <h2 className={styles.Title}>
        Campañas
      </h2>

      <input
        type="text"
        className={styles.Search}
        placeholder="Buscar campaña o ID organización..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {
        loading
          ?
          <p className={styles.Empty}>Cargando...</p>
          :
          campaniasFiltradas.length === 0
            ?
            <p className={styles.Empty}>
              No se encontraron campañas
            </p>
            :
            campaniasFiltradas.map(camp => (

              <div
                key={camp.id}
                className={styles.UserRow}
              >

                <div>

                  <strong>
                    {camp.title}
                  </strong>

                  <div className={styles.Email}>
                    Org: {camp.organizationName} (ID {camp.organizationId})
                  </div>

                  <div className={styles.Email}>
                    Objetivo: {camp.objective.toLocaleString()} puntos
                  </div>

                </div>

                <div className={styles.Actions}>

                  <button
                    className={styles.Check}
                    disabled={camp.enabled}
                    onClick={() => toggleCampania(camp)}
                  >
                    ✓
                  </button>

                  <button
                    className={styles.Cross}
                    disabled={!camp.enabled}
                    onClick={() => toggleCampania(camp)}
                  >
                    ✕
                  </button>

                </div>

              </div>

            ))
      }

      <div className={styles.Pagination}>

        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
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
