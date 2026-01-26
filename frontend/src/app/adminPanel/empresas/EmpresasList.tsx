'use client';

import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import styles from '@/styles/adminUsersPanel.module.css';

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

export default function EmpresasList() {
  const [empresas, setEmpresas] = useState<Empresa[]>(MOCK_EMPRESAS);
  const [search, setSearch] = useState('');

  /* ===============================
     FILTRO
  ================================ */
  const filteredEmpresas = useMemo(() => {
    const value = search.toLowerCase();
    return empresas.filter(e =>
      e.name.toLowerCase().includes(value)
    );
  }, [empresas, search]);

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

  return (
    <div className={styles.UsersBox}>
      <h2 className={styles.Title}>Empresas</h2>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        className={styles.Search}
        placeholder="Buscar empresa..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filteredEmpresas.length === 0 && (
        <p className={styles.Empty}>No se encontraron empresas</p>
      )}

      {filteredEmpresas.map(empresa => (
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
      ))}
    </div>
  );
}
