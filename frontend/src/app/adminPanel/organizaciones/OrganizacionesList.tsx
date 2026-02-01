'use client';

import { useState, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/adminUsersPanel.module.css';
import { BaseApi } from '@/API/baseApi';

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

const PAGE_SIZE = 10;

export default function OrganizacionesList() {
  const [page, setPage] = useState(1);
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>(MOCK_ORGANIZACIONES);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [organizacionesCount, setOrganizacionesCount] = useState(0);

  /* ===============================
       PAGINACIÓN
    ================================ */
    const totalPages = Math.ceil(organizacionesCount / PAGE_SIZE) || 1;
  
    useEffect(() => {
      async function fetchUsers() {
        const api = new BaseApi();
        const res = await api.organizacion.getAllPaginated(page, PAGE_SIZE, search);
        const usersFormated = res.items.map((u: any) => ({
          id: u.id,
          name: u.razonSocial,
          enabled: !u.deshabilitado,
        }));
        
        setOrganizaciones(usersFormated);
        setOrganizacionesCount(res.total);
        setLoading(false);
      }
  
      fetchUsers();
    }, [page, search]);

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

  /* ===============================
     RESET PAGE AL BUSCAR
  ================================ */
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
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
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* LISTA DE ORGANIZACIONES */}
      {
        organizaciones.length === 0?
            <p className={styles.Empty}>No se encontraron organizaciones</p>
          :
            organizaciones.map(org => (
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
