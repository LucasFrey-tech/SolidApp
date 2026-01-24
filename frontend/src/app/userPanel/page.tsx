'use client';

import { useEffect, useState } from "react";
import styles from "@/styles/userPanel.module.css";

import MyAccount from "@/components/pages/MyAccount";
import UserAndPass from "@/components/pages/User&Pass";
import UserData from "@/components/pages/data/userData";
import EmpresaData from "@/components/pages/data/empresaData";
import OrganizacionData from "@/components/pages/data/organizacionData";
import HistorialDonacionUsuario from "@/components/pages/historialDonacionUsuario";

type Section = 'data' | 'user&pass' | 'cupons' | 'donations';

export default function Panel() {
  const [activeSection, setActiveSection] = useState<Section>('data');
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserType(payload.userType || 'usuario');
    } catch (error) {
      console.error("Error al decodificar token:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const renderDataSection = () => {
    if (loading) {
      return <p>Cargando datos...</p>;
    }

    switch (userType) {
      case 'empresa':
        return <EmpresaData />;
      case 'organizacion':
        return <OrganizacionData />;
      default:
        return <UserData />;
    }
  };

  return (
    <div className={styles.PanelLayout}>
      <main className={styles.Panel}>
        {/* CONTENIDO */}
        <section className={styles.Content}>
          {activeSection === 'data' && renderDataSection()}
          {activeSection === 'user&pass' && <UserAndPass />}
          {activeSection === 'cupons' && <p>Mis cupones</p>}
          {activeSection === 'donations' && <HistorialDonacionUsuario />}
        </section>

        {/* MENÚ */}
        <MyAccount onChangeSection={setActiveSection} />
      </main>
    </div>
  );
}
