'use client';

import { useState, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/adminUsersPanel.module.css';
import { BaseApi } from '@/API/baseApi';

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

const PAGE_SIZE = 10;


export default function UsuariosAdminPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [loading, setLoading] = useState(true);
  const [usersCount, setUsersCount] = useState(0);


  /* ===============================
     PAGINACIÓN
  ================================ */
  const totalPages = Math.ceil(usersCount / PAGE_SIZE) || 1;

  useEffect(() => {
    async function fetchUsers() {
      const api = new BaseApi();
      const res = await api.users.getAllPaginated(page, PAGE_SIZE, search);
      const usersFormated = res.items.map((u: any) => ({
        id: u.id,
        name: u.nombre,
        email: u.correo,
        enabled: !u.deshabilitado,
      }));
      
      setUsers(usersFormated);
      setUsersCount(res.total);
      setLoading(false);
    }

    fetchUsers();
  }, [page, search]);

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

  if (loading) return <p>Cargando usuarios...</p>;

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
      {
        users.length === 0? 
          (<p className={styles.Empty}>No se encontraron usuarios</p>)
        :
          users.map(user => (
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
