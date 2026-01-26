'use client';

import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/adminUsersPanel.module.css';

type OrganizationCampaign = {
  id: number;
  organizationId: number;
  organizationName: string;
  campaignTitle: string;
  objective: number;
  enabled: boolean;
};

/* ===============================
   MOCK
================================ */
const MOCK_CAMPAIGNS: OrganizationCampaign[] = Array.from({ length: 17 }).map(
  (_, i) => ({
    id: i + 1,
    organizationId: 100 + i,
    organizationName: `Organización ${i + 1}`,
    campaignTitle: `Campaña Solidaria ${i + 1}`,
    objective: (i + 1) * 500,
    enabled: i % 4 !== 0,
  })
);

const PAGE_SIZE = 5;

/* ===============================
   COMPONENTE
================================ */
export default function OrganizacionesAdminPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [campaigns, setCampaigns] =
    useState<OrganizationCampaign[]>(MOCK_CAMPAIGNS);

  /* ===============================
     FILTRO
  ================================ */
  const filteredCampaigns = useMemo(() => {
    const value = search.toLowerCase();

    return campaigns.filter(c =>
      c.campaignTitle.toLowerCase().includes(value) ||
      c.organizationId.toString().includes(value)
    );
  }, [campaigns, search]);

  /* ===============================
     PAGINACIÓN
  ================================ */
  const totalPages = Math.ceil(filteredCampaigns.length / PAGE_SIZE) || 1;
  const start = (page - 1) * PAGE_SIZE;
  const currentCampaigns = filteredCampaigns.slice(start, start + PAGE_SIZE);

  /* ===============================
     TOGGLE
  ================================ */
  const confirmToggleCampaign = (campaign: OrganizationCampaign) => {
    Swal.fire({
      title: campaign.enabled
        ? '¿Deshabilitar campaña?'
        : '¿Habilitar campaña?',
      text: `${campaign.campaignTitle} (${campaign.organizationName})`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        setCampaigns(prev =>
          prev.map(c =>
            c.id === campaign.id
              ? { ...c, enabled: !c.enabled }
              : c
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

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Organizaciones & Campañas</h2>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar por campaña o ID de organización..."
        className={styles.Search}
        value={search}
        onChange={e => handleSearch(e.target.value)}
      />

      {/* 📦 LISTA */}
      {currentCampaigns.length === 0 && (
        <p className={styles.Empty}>No se encontraron campañas</p>
      )}

      {currentCampaigns.map(campaign => (
        <div key={campaign.id} className={styles.UserRow}>
          <div>
            <strong>{campaign.campaignTitle}</strong>

            <div className={styles.Email}>
              Org: {campaign.organizationName} (ID {campaign.organizationId})
            </div>

            <div className={styles.Email}>
              Objetivo: {campaign.objective.toLocaleString()} puntos
            </div>
          </div>

          <div className={styles.Actions}>
            <button
              className={styles.Check}
              disabled={campaign.enabled}
              onClick={() => confirmToggleCampaign(campaign)}
            >
              ✓
            </button>

            <button
              className={styles.Cross}
              disabled={!campaign.enabled}
              onClick={() => confirmToggleCampaign(campaign)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}

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
