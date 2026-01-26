'use client';

import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/adminUsersPanel.module.css';

type Organizacion = {
  id: number;
  name: string;
  enabled: boolean;
};

/* ===============================
   MOCK
================================ */
const MOCK_ORGANIZACIONES: Organizacion[] = Array.from({ length: 14 }).map(
  (_, i) => ({
    id: i + 1,
    name: `Organización ${i + 1}`,
    enabled: i % 4 !== 0,
  })
);

export default function OrganizacionesList() {
  const [organizaciones, setOrganizaciones] =
    useState<Organizacion[]>(MOCK_ORGANIZACIONES);
  const [search, setSearch] = useState('');

  /* ===============================
     FILTRO
  ================================ */
  const filtered = useMemo(() => {
    const value = search.toLowerCase();
    return organizaciones.filter(o =>
      o.name.toLowerCase().includes(value)
    );
  }, [organizaciones, search]);

  /* ===============================
     TOGGLE
  ================================ */
  const toggleOrganizacion = (org: Organizacion) => {
    Swal.fire({
      title: org.enabled
        ? '¿Deshabilitar organización?'
        : '¿Habilitar organización?',
      text: org.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then(res => {
      if (res.isConfirmed) {
        setOrganizaciones(prev =>
          prev.map(o =>
            o.id === org.id ? { ...o, enabled: !o.enabled } : o
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
      <h2 className={styles.Title}>Organizaciones</h2>

      {/*BUSCADOR */}
      <input
        type="text"
        className={styles.Search}
        placeholder="Buscar organización..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.length === 0 && (
        <p className={styles.Empty}>No se encontraron organizaciones</p>
      )}

      {filtered.map(org => (
        <div key={org.id} className={styles.UserRow}>
          <strong>{org.name}</strong>

          <div className={styles.Actions}>
            <button
              className={styles.Check}
              disabled={org.enabled}
              onClick={() => toggleOrganizacion(org)}
            >
              ✓
            </button>
            <button
              className={styles.Cross}
              disabled={!org.enabled}
              onClick={() => toggleOrganizacion(org)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
