'use client';

import { useState } from 'react';
import styles from '@/styles/Paneles/adminUsersPanel.module.css';

import UsuariosAdminPanel from './usuarios/UsuariosAdminPanel';
import EmpresasAdminPanel from './empresas/EmpresasAdminPanel';
import OrganizacionesAdminPanel from './organizaciones/OrganizacionesAdminPanel';

type View = 'usuarios' | 'empresa' | 'organizacion';

export default function AdminPage() {
  const [view, setView] = useState<View>('usuarios');

  const getButtonClass = (value: View) =>
    view === value ? styles.ActiveButton : '';

  return (
    <div className={styles.PanelLayout}>
      <main className={styles.Panel}>
        <section className={styles.Content}>
          <div className={styles.Selector}>
            <button
              className={`${styles.ButtonBase} ${getButtonClass('usuarios')}`}
              onClick={() => setView('usuarios')}
            >
              Usuarios
            </button>

            <button
              className={`${styles.ButtonBase} ${getButtonClass('empresa')}`}
              onClick={() => setView('empresa')}
            >
              Empresas
            </button>

            <button
              className={`${styles.ButtonBase} ${getButtonClass('organizacion')}`}
              onClick={() => setView('organizacion')}
            >
              Organizaciones
            </button>
          </div>

          <div className={view === 'usuarios' ? '' : 'hidden'}>
            <UsuariosAdminPanel />
          </div>

          <div className={view === 'empresa' ? '' : 'hidden'}>
            <EmpresasAdminPanel />
          </div>

          <div className={view === 'organizacion' ? '' : 'hidden'}>
            <OrganizacionesAdminPanel />
          </div>
        </section>
      </main>
    </div>
  );
}