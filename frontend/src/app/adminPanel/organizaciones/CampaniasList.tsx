'use client';

import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/adminUsersPanel.module.css';

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

export default function CampaniasList() {
  const [campanias, setCampanias] = useState(MOCK_CAMPANIAS);
  const [search, setSearch] = useState('');

  /* ===============================
     FILTRO
  ================================ */
  const filtered = useMemo(() => {
    const value = search.toLowerCase();
    return campanias.filter(c =>
      c.title.toLowerCase().includes(value) ||
      c.organizationId.toString().includes(value)
    );
  }, [campanias, search]);

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

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Campañas</h2>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        className={styles.Search}
        placeholder="Buscar campaña o ID organización..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.length === 0 && (
        <p className={styles.Empty}>No se encontraron campañas</p>
      )}

      {filtered.map(camp => (
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
      ))}
    </div>
  );
}
