"use client";

import { useState } from "react";
import styles from "@/styles/UserPanel/userPanel.module.css";

import MyAccount from "@/components/pages/perfil/MyAccount";
import UserAndPass from "@/components/pages/perfil/User&Pass";
import UserData from "@/components/pages/data/userData";
import EmpresaData from "@/components/pages/data/empresaData";
import OrganizacionData from "@/components/pages/data/organizacionData";
import HistorialDonacionUsuario from "@/components/pages/perfil/historialDonacionUsuario";
import UserCoupons from "@/components/pages/perfil/cuponesUsuarios";
import { RolCuenta } from "@/API/types/register";
import { useUser } from "../context/UserContext";

type Section = "data" | "user&pass" | "cupons" | "donations";

export default function Panel() {
  const [activeSection, setActiveSection] = useState<Section>("data");
  const { user, loading } = useUser();

  const renderDataSection = () => {
    console.log("loading:", loading);
    console.log("user:", user);
    console.log("user.role:", user?.role);

    if (loading || !user) return <p>Cargando...</p>;

    switch (user?.role) {
      case RolCuenta.EMPRESA:
        return <EmpresaData />;
      case RolCuenta.ORGANIZACION:
        return <OrganizacionData />;
      default:
        return <UserData />;
    }
  };

  return (
    <div className={styles.PanelLayout}>
      <main className={styles.Panel}>
        <section className={styles.Content}>
          {activeSection === "data" && renderDataSection()}
          {activeSection === "user&pass" && <UserAndPass />}
          {activeSection === "cupons" && <UserCoupons />}
          {activeSection === "donations" && <HistorialDonacionUsuario />}
        </section>

        <MyAccount onChangeSection={setActiveSection} />
      </main>
    </div>
  );
}
