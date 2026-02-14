'use client';

import { useState, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/Paneles/adminUsersPanel.module.css';
import { BaseApi } from '@/API/baseApi';

type Campania = {
  id: number;
  organizationId: number;
  organizationName: string;
  title: string;
  objective: number;
  enabled: boolean;
};

/* ===============================
   MOCK
================================ */
const MOCK_CAMPANIAS: Campania[] = Array.from({ length: 18 }).map(
  (_, i) => ({
    id: i + 1,
    organizationId: 200 + i,
    organizationName: `Organización ${i + 1}`,
    title: `Campaña ${i + 1}`,
    objective: (i + 1) * 1000,
    enabled: i % 3 !== 0,
  })
);

const PAGE_SIZE = 10;

export default function CampaniasList() {
  const [page, setPage] = useState(1);
  const [campanias, setCampanias] = useState(MOCK_CAMPANIAS);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [campaniasCount, setCampaniasCount] = useState(0);

    /* ===============================
       PAGINACIÓN
    ================================ */
    const totalPages = Math.ceil(campaniasCount / PAGE_SIZE) || 1;
  
    useEffect(() => {
      async function fetchUsers() {
        const api = new BaseApi();
        const res = await api.organizacion.getOrganizationCampaignsPaginated(page, PAGE_SIZE);
        console.log(res);
        const campaniasFormated = res.items.map((u: any) => ({
          id: u.id,
          organizationId: u.organizacion.id,
          organizationName: u.organizacion.nombreFantasia,
          title: u.titulo,
          objective: u.objetivo,
          enabled: u.estado == 'activa'? true : false,
        }));
        
        setCampanias(campaniasFormated);
        setCampaniasCount(res.total);
        setLoading(false);
      }
  
      fetchUsers();
    }, [page, search]);

  /* ===============================
     TOGGLE
  ================================ */
  const toggleCampania = (camp: Campania) => {
    Swal.fire({
      title: camp.enabled
        ? '¿Deshabilitar campaña?'
        : '¿Habilitar campaña?',
      text: `${camp.title} (${camp.organizationName})`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then(res => {
      if (res.isConfirmed) {
        setCampanias(prev =>
          prev.map(c =>
            c.id === camp.id ? { ...c, enabled: !c.enabled } : c
          )
        );

        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  /* ===============================
     RESET PAGE AL BUSCAR
  ================================ */
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Campañas</h2>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        className={styles.Search}
        placeholder="Buscar campaña o ID organización..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* LISTA DE CAMPAÑAS */}
      {
        campanias.length === 0?
          <p className={styles.Empty}>No se encontraron campañas</p>
        :
          campanias.map(camp => (
            <div key={camp.id} className={styles.UserRow}>
              <div>
                <strong>{camp.title}</strong>
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

      {/* 📄 PAGINACIÓN */}
      <div className={styles.Pagination}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Anterior
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
