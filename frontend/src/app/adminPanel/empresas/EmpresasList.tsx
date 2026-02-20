'use client';

import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/Paneles/adminUsersPanel.module.css';
import { baseApi } from '@/API/baseApi';

type Empresa = {
  id: number;
  name: string;
  enabled: boolean;
};

const PAGE_SIZE = 10;

export default function EmpresasList() {
  const [page, setPage] = useState(1);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [empresasCount, setEmpresasCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalPages = Math.ceil(empresasCount / PAGE_SIZE) || 1;

  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const res = await baseApi.empresa.getAllPaginated(page, PAGE_SIZE, search);
      const empresasFormated = res.items.map((u: any) => ({
        id: u.id,
        name: u.razon_social,
        enabled: !u.deshabilitado,
      }));
      setEmpresas(empresasFormated);
      setEmpresasCount(res.total);
    } catch (error) {
      console.error('Error del fetch empresas: ', error);
      Swal.fire('Error', 'No se pudieron cargar las empresas', 'error');
    } finally {
      setLoading(false);
      // Restaurar foco en input
      if (inputRef.current) inputRef.current.focus();
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, [page, search]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  };

  const toggleEmpresa = async (empresa: Empresa) => {
    const result = await Swal.fire({
      title: empresa.enabled ? '¿Deshabilitar empresa?' : '¿Habilitar empresa?',
      text: empresa.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await baseApi.empresa.update(empresa.id, { deshabilitado: empresa.enabled });

      setEmpresas((prev) =>
        prev.map((e) => (e.id === empresa.id ? { ...e, enabled: !e.enabled } : e))
      );

      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar la empresa', 'error');
    }
  };

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Empresas</h2>

      <input
        type="text"
        ref={inputRef}
        className={styles.Search}
        placeholder="Buscar empresa..."
        value={searchInput}
        onChange={(e) => handleSearchChange(e.target.value)}
      />

      {loading ? (
        <p>Cargando empresas...</p>
      ) : empresas.length === 0 ? (
        <p className={styles.Empty}>No se encontraron empresas</p>
      ) : (
        empresas.map((empresa) => (
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
      )}

      <div className={styles.Pagination}>
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
          Siguiente
        </button>
      </div>
    </div>
  );
}