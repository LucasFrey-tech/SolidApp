'use client';

import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/adminUsersPanel.module.css';

type User = {
  id: number;
  name: string;
  email: string;
  enabled: boolean;
};

const MOCK_USERS: User[] = Array.from({ length: 18 }).map((_, i) => ({
  id: i + 1,
  name: `Usuario ${i + 1}`,
  email: `usuario${i + 1}@mail.com`,
  enabled: i % 3 !== 0,
}));

const PAGE_SIZE = 5;

export default function UsuariosAdminPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  /* ===============================
     FILTRO
  ================================ */
  const filteredUsers = useMemo(() => {
    const value = search.toLowerCase();

    return users.filter(
      user =>
        user.name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value)
    );
  }, [users, search]);

  /* ===============================
     PAGINACIÓN
  ================================ */
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const start = (page - 1) * PAGE_SIZE;
  const currentUsers = filteredUsers.slice(start, start + PAGE_SIZE);

  /* ===============================
     TOGGLE USER
  ================================ */
  const confirmToggleUser = (user: User) => {
    Swal.fire({
      title: user.enabled
        ? '¿Deshabilitar usuario?'
        : '¿Habilitar usuario?',
      text: `Usuario: ${user.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        setUsers(prev =>
          prev.map(u =>
            u.id === user.id ? { ...u, enabled: !u.enabled } : u
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
      <h2 className={styles.Title}>Usuarios</h2>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        className={styles.Search}
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* 👤 LISTA */}
      {currentUsers.length === 0 && (
        <p className={styles.Empty}>No se encontraron usuarios</p>
      )}

      {currentUsers.map(user => (
        <div key={user.id} className={styles.UserRow}>
          <div>
            <strong>{user.name}</strong>
            <div className={styles.Email}>{user.email}</div>
          </div>

          <div className={styles.Actions}>
            <button
              className={styles.Check}
              disabled={user.enabled}
              onClick={() => confirmToggleUser(user)}
            >
              ✓
            </button>
            <button
              className={styles.Cross}
              disabled={!user.enabled}
              onClick={() => confirmToggleUser(user)}
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
