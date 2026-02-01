'use client';

import { useState, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/adminUsersPanel.module.css';
import { BaseApi } from '@/API/baseApi';

type Empresa = {
  id: number;
  name: string;
  enabled: boolean;
};

/* ===============================
   MOCK
================================ */
const MOCK_EMPRESAS: Empresa[] = Array.from({ length: 15 }).map((_, i) => ({
  id: i + 1,
  name: `Empresa ${i + 1}`,
  enabled: i % 3 !== 0,
}));

const PAGE_SIZE = 10;

export default function EmpresasList() {
  const [page, setPage] = useState(1);
  const [empresas, setEmpresas] = useState<Empresa[]>(MOCK_EMPRESAS);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [empresasCount, setEmpresasCount] = useState(0);

  /* ===============================
     PAGINACIÓN
  ================================ */
  const totalPages = Math.ceil(empresasCount / PAGE_SIZE) || 1;

  /* ===============================
     TOGGLE
  ================================ */
  const toggleEmpresa = (empresa: Empresa) => {
    Swal.fire({
      title: empresa.enabled
        ? '¿Deshabilitar empresa?'
        : '¿Habilitar empresa?',
      text: empresa.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then(res => {
      if (res.isConfirmed) {
        setEmpresas(prev =>
          prev.map(e =>
            e.id === empresa.id
              ? { ...e, enabled: !e.enabled }
              : e
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

  useEffect(() => {
      async function fetchUsers() {
        const api = new BaseApi();
        const res = await api.empresa.getAllPaginated(page, PAGE_SIZE, search);
        const empresasFormated = res.items.map((u: any) => ({
          id: u.id,
          name: u.razon_social,
          enabled: !u.deshabilitado,
        }));
        console.log(res);
        setEmpresas(empresasFormated);
        setEmpresasCount(res.total);
        setLoading(false);
      }
  
      fetchUsers();
    }, [page, search]);

  /* ===============================
     RESET PAGE AL BUSCAR
  ================================ */
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (loading) return <p>Cargando empresas...</p>;

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Empresas</h2>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        className={styles.Search}
        placeholder="Buscar empresa..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {
        empresas.length === 0 ? 
          <p className={styles.Empty}>No se encontraron empresas</p>
        :
          empresas.map(empresa => (
            <div key={empresa.id} className={styles.UserRow}>
              <strong>{empresa.name}</strong>

              <div className={styles.Actions}>
                <button
                  className={styles.Check}
                  disabled={empresa.enabled}
                  onClick={() => toggleEmpresa(empresa)}
                >
                  ✓
                </button>
                <button
                  className={styles.Cross}
                  disabled={!empresa.enabled}
                  onClick={() => toggleEmpresa(empresa)}
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
