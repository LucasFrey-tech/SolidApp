'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [users, setUsers] = useState<User[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // =============================
  // FETCH USUARIOS
  // =============================
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await baseApi.users.getAllPaginated(
          page,
          PAGE_SIZE,
          search
        );

        const formatted = res.items.map((u: any) => ({
          id: u.id,
          name: `${u.nombre || ''} ${u.apellido || ''}`.trim() || 'Sin nombre',
          email: u.correo,
          enabled: !u.deshabilitado,
          role: u.rol || 'user',
        }));

        setUsers(formatted);
        setUsersCount(res.total);
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [page, search]);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  // =============================
  // BUSCADOR
  // =============================
  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  };

  // =============================
  // HABILITAR / DESHABILITAR 
  // =============================
  const toggleUserStatus = async (user: User, enable: boolean) => {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres ${enable ? 'habilitar' : 'deshabilitar'} este usuario?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    });

    if (!confirm.isConfirmed) return;

    setUpdatingUserId(user.id);

    // Actualización
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, enabled: enable } : u
      )
    );

    try {
      if (enable) {
        await baseApi.users.restore(user.id);
      } else {
        await baseApi.users.delete(user.id);
      }

      Swal.fire(
        'Éxito',
        `Usuario ${enable ? 'habilitado' : 'deshabilitado'} correctamente`,
        'success'
      );
    } catch (err) {
      console.error(err);

      // revertir si falla
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, enabled: !enable } : u
        )
      );

      Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const totalPages = Math.ceil(usersCount / PAGE_SIZE) || 1;

  // =============================
  // RENDER
  // =============================
  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Usuarios</h2>

      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        className={styles.Search}
        value={searchInput}
        onChange={(e) => handleSearchChange(e.target.value)}
      />

      {loading ? (
        <p className={styles.Empty}>Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p className={styles.Empty}>No se encontraron usuarios</p>
      ) : (
        users.map((user) => (
          <div key={user.id} className={styles.UserRow}>
            <div>
              <strong>{user.name}</strong>
              <div className={styles.Email}>{user.email}</div>
            </div>

            <div className={styles.Actions}>
              {user.role.toLowerCase() === 'admin' ? (
                <span className={styles.AdminLabel}>ADMIN</span>
              ) : (
                <>
                  <button
                    className={styles.Check}
                    disabled={user.enabled || updatingUserId === user.id}
                    onClick={() => toggleUserStatus(user, true)}
                  >
                    {updatingUserId === user.id ? '...' : '✓'}
                  </button>

                  <button
                    className={styles.Cross}
                    disabled={!user.enabled || updatingUserId === user.id}
                    onClick={() => toggleUserStatus(user, false)}
                  >
                    {updatingUserId === user.id ? '...' : '✕'}
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
          onClick={() => setPage((p) => p - 1)}
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