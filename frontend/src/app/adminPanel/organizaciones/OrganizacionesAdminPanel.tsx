'use client';

import { useState } from 'react';
import styles from '@/styles/Paneles/adminUsersPanel.module.css';

import OrganizacionesList from './OrganizacionesList';
import CampaniasList from './CampaniasList';

type View = 'organizaciones' | 'campanias';

export default function OrganizacionesAdminPanel() {
  const [view, setView] = useState<View>('organizaciones');

  const getButtonClass = (value: View) =>
    view === value ? styles.ActiveButton : '';

  return (
    <>
      <div className={styles.Selector}>
        <button
          className={`${styles.ButtonBase} ${getButtonClass('organizaciones')}`}
          onClick={() => setView('organizaciones')}
        >
          Organizaciones
        </button>

        <button
          className={`${styles.ButtonBase} ${getButtonClass('campanias')}`}
          onClick={() => setView('campanias')}
        >
          Campañas
        </button>
      </div>

      {view === 'organizaciones' && <OrganizacionesList />}
      {view === 'campanias' && <CampaniasList />}
    </>
  );
}