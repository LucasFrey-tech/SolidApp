'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/Paneles/adminUsersPanel.module.css';
import { baseApi } from '@/API/baseApi';

type User = {
  id: number;
  name: string;
  email: string;
  enabled: boolean;
  role: string;
};

const PAGE_SIZE = 10;

export default function UsuariosAdminPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersCount, setUsersCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);

        const res = await baseApi.users.getAllPaginated(
          page,
          PAGE_SIZE,
          search
        );

        const formatted = res.items.map((u: any) => ({
          id: u.id,
          name:
            `${u.nombre || ''} ${u.apellido || ''}`.trim() ||
            'Sin nombre',
          email: u.correo,
          enabled: !u.deshabilitado,
          role: u.rol || 'user',
        }));

        setUsers(formatted);
        setUsersCount(res.total);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los usuarios',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [page, search, refreshTrigger]);

  const totalPages = Math.ceil(usersCount / PAGE_SIZE) || 1;

  const toggleUser = async (user: User) => {
    // PROTECCIÓN: no permitir acciones sobre admin
    if (user.role?.toLowerCase() === 'admin') {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No se puede modificar un administrador',
      });
      return;
    }

    const quiereHabilitar = !user.enabled;

    const title = quiereHabilitar
      ? '¿Habilitar usuario?'
      : '¿Deshabilitar usuario?';

    const confirmed = await Swal.fire({
      title,
      text: `${user.name} (${user.email})`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((res) => res.isConfirmed);

    if (!confirmed) return;

    try {
      if (quiereHabilitar) {
        await baseApi.users.restore(user.id);
      } else {
        await baseApi.users.delete(user.id);
      }

      setRefreshTrigger((prev) => prev + 1);

      Swal.fire({
        icon: 'success',
        title: quiereHabilitar
          ? 'Usuario habilitado'
          : 'Usuario deshabilitado',
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error(
        'Error al cambiar estado del usuario:',
        err
      );

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          err.message ||
          'No se pudo cambiar el estado del usuario',
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (loading)
    return (
      <p className={styles.Empty}>
        Cargando usuarios...
      </p>
    );

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Usuarios</h2>

      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        className={styles.Search}
        value={search}
        onChange={(e) =>
          handleSearch(e.target.value)
        }
      />

      {users.length === 0 ? (
        <p className={styles.Empty}>
          No se encontraron usuarios
        </p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className={styles.UserRow}
          >
            <div>
              <strong>{user.name}</strong>

              <div className={styles.Email}>
                {user.email}
              </div>
            </div>

            <div className={styles.Actions}>
              {user.role?.toLowerCase() ===
              'admin' ? (
                <span
                  className={styles.AdminLabel}
                >
                  ADMIN
                </span>
              ) : (
                <>
                  <button
                    className={styles.Check}
                    disabled={user.enabled}
                    onClick={() =>
                      toggleUser(user)
                    }
                    title={
                      user.enabled
                        ? 'Ya está habilitado'
                        : 'Habilitar usuario'
                    }
                  >
                    ✓
                  </button>

                  <button
                    className={styles.Cross}
                    disabled={!user.enabled}
                    onClick={() =>
                      toggleUser(user)
                    }
                    title={
                      user.enabled
                        ? 'Deshabilitar usuario'
                        : 'Ya está deshabilitado'
                    }
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}

      <div className={styles.Pagination}>
        <button
          disabled={page === 1}
          onClick={() =>
            setPage((p) => p - 1)
          }
        >
          Anterior
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() =>
            setPage((p) => p + 1)
          }
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}