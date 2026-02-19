'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/Paneles/adminUsersPanel.module.css';
import { baseApi } from '@/API/baseApi';

type Organizacion = {
  id: number;
  name: string;
  habilitado: boolean;
};

const PAGE_SIZE = 10;

export default function OrganizacionesList() {
  const [page, setPage] = useState(1);
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchOrganizaciones = async () => {
    try {
      setLoading(true);

      const res = await baseApi.organizacion.getAllPaginated(
        page,
        PAGE_SIZE,
        search,
        true // incluir deshabilitadas
      );

      const formatted = res.items.map((u: any) => ({
        id: u.id,
        name: u.razonSocial,
        habilitado: !u.deshabilitado,
      }));

      setOrganizaciones(formatted);
      setTotalCount(res.total);
    } catch (error) {
      console.error('Error al cargar organizaciones:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las organizaciones',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizaciones();
  }, [page, search, refreshKey]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const toggleOrganizacion = async (org: Organizacion) => {
    const quiereHabilitar = !org.habilitado;

    const title = quiereHabilitar
      ? '¿Habilitar organización?'
      : '¿Deshabilitar organización?';

    const confirmed = await Swal.fire({
      title,
      text: org.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((res) => res.isConfirmed);

    if (!confirmed) return;

    try {
      if (quiereHabilitar) {
        await baseApi.organizacion.restore(org.id);
      } else {
        await baseApi.organizacion.delete(org.id);
      }

      setRefreshKey((prev) => prev + 1);

      Swal.fire({
        icon: 'success',
        title: quiereHabilitar ? 'Habilitada' : 'Deshabilitada',
        text: org.name,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo cambiar el estado',
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (loading) {
    return <div className={styles.UsersBox}>Cargando...</div>;
  }

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Organizaciones</h2>

      <input
        type="text"
        className={styles.Search}
        placeholder="Buscar organización..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {organizaciones.length === 0 ? (
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
                title="Habilitar"
              >
                ✓
              </button>

              <button
                className={styles.Cross}
                disabled={!org.habilitado}
                onClick={() => toggleOrganizacion(org)}
                title="Deshabilitar"
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
