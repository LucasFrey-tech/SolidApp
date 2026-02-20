'use client';

import { useState } from 'react';
import styles from '@/styles/Paneles/adminUsersPanel.module.css';
import EmpresasList from './EmpresasList';
import CuponesEmpresaList from './CuponesEmpresaList';

type View = 'empresas' | 'cupones';

export default function EmpresasAdminPanel() {
  const [view, setView] = useState<View>('empresas');

  const getButtonClass = (value: View) =>
    view === value ? styles.ActiveButton : '';

  return (
    <>
      <div className={styles.Selector}>
        <button
          className={`${styles.ButtonBase} ${getButtonClass('empresas')}`}
          onClick={() => setView('empresas')}
        >
          Empresas
        </button>

        <button
          className={`${styles.ButtonBase} ${getButtonClass('cupones')}`}
          onClick={() => setView('cupones')}
        >
          Cupones
        </button>
      </div>

      {view === 'empresas' && <EmpresasList />}
      {view === 'cupones' && <CuponesEmpresaList />}
    </>
  );
}