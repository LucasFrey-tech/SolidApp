'use client'

import { useEffect, useState } from "react";
import styles from "@/styles/userPanel.module.css";

import MyAccount from "@/components/pages/MyAccount";
import UserAndPass from "@/components/pages/User&Pass";
import UserData from "@/components/pages/data/userData";
import EmpresaData from "@/components/pages/data/empresaData";
import OrganizacionData from "@/components/pages/data/organizacionData";
import HistorialDonacionUsuario from "@/components/pages/historialDonacionUsuario";

type Section =
  | 'data'
  | 'user&pass'
  | 'cupons'
  | 'donations'
  | 'credentials';

export default function Panel() {
  const [activeSection, setActiveSection] = useState<Section>('data');
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserType = () => {
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
    };

    getUserType();
  }, []);

  const renderDataSection = () => {
    if (loading) {
      return (
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando datos del usuario...</p>
        </div>
      );
    }

    switch (userType) {
      case 'usuario':
        return <UserData />;
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
        {/* CONTENIDO IZQUIERDA */}
        <section className={styles.Content}>
          {activeSection === 'data' && renderDataSection()}
          {activeSection === 'user&pass' && <UserAndPass />}
          {activeSection === 'donations' && <HistorialDonacionUsuario />}
        </section>

        {/* MENÚ DERECHA */}
        <MyAccount onChangeSection={(section) => setActiveSection(section as Section)} activeSection={"data"} />
      </main>
    </div>
  );
}
