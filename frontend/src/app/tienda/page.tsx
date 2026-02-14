'use client';

import { useState } from 'react';
import styles from '@/styles/Tienda/tiendaTabs.module.css';

import Tienda from '@/components/pages/tienda/Tienda';
import Empresas from '@/components/pages/tienda/Empresa';

type Tab = 'general' | 'empresas';

export default function TiendaEmpresasPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  return (
    <main className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === 'general' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>

        <button
          className={`${styles.tab} ${
            activeTab === 'empresas' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('empresas')}
        >
          Empresas
        </button>
      </div>

      <section className={styles.content}>
        {activeTab === 'general' && <Tienda />}
        {activeTab === 'empresas' && <Empresas />}
      </section>
    </main>
  );
}
