'use client';

import { useState } from 'react';
import styles from '@/styles/adminUsersPanel.module.css';

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
          {/* SELECTOR */}
          <div className={styles.Selector}>
            <button
              onClick={() => setView('usuarios')}
              className={getButtonClass('usuarios')}
            >
              Usuarios
            </button>

            <button
              onClick={() => setView('empresa')}
              className={getButtonClass('empresa')}
            >
              Empresas
            </button>

            <button
              onClick={() => setView('organizacion')}
              className={getButtonClass('organizacion')}
            >
              Organizaciones
            </button>
          </div>

          {/* CONTENIDO */}
          {view === 'usuarios' && <UsuariosAdminPanel />}
          {view === 'empresa' && <EmpresasAdminPanel />}
          {view === 'organizacion' && <OrganizacionesAdminPanel />}
        </section>
      </main>
    </div>
  );
}
