"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/UserPanel/userPanel.module.css";

import MyAccount from "@/components/pages/perfil/MyAccount";
import UserAndPass from "@/components/pages/perfil/User&Pass";
import UserData from "@/components/pages/data/userData";
import EmpresaData from "@/components/pages/data/empresaData";
import OrganizacionData from "@/components/pages/data/organizacionData";
import HistorialDonacionUsuario from "@/components/pages/perfil/historialDonacionUsuario";
import UserCoupons from "@/components/pages/perfil/cuponesUsuarios";
import { RolCuenta } from "@/API/types/auth";
import { useUser } from "../context/UserContext";

type Section = "data" | "user&pass" | "cupons" | "donations";

const rolePermissions: Record<RolCuenta, Section[]> = {
  [RolCuenta.ADMIN]: ["user&pass"],
  [RolCuenta.USUARIO]: ["data", "user&pass", "cupons", "donations"],
  [RolCuenta.EMPRESA]: ["data", "user&pass", "cupons"],
  [RolCuenta.ORGANIZACION]: ["data", "user&pass", "donations"],
};

export default function Panel() {
  const [activeSection, setActiveSection] = useState<Section>("data");
  const { user, loading } = useUser();

  useEffect(() => {
    if (user) {
      const validSections = rolePermissions[user.role as RolCuenta] || [];

      if (!validSections.includes(activeSection)) {
        setActiveSection(validSections[0] || "user&pass");
      }
    }
  }, [user, activeSection]);

  const renderDataSection = () => {
    if (loading || !user) return <p>Cargando...</p>;

    switch (user?.role) {
      case RolCuenta.EMPRESA:
        return <EmpresaData />;
      case RolCuenta.ORGANIZACION:
        return <OrganizacionData />;
      case RolCuenta.USUARIO:
        return <UserData />;
      default:
        return null;
    }
  };

  const isSectionAllowed = (section: Section): boolean => {
    if (!user) return false;
    const allowedSections = rolePermissions[user.role as RolCuenta] || [];
    return allowedSections.includes(section);
  };

  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>No hay usuario</p>;

  return (
    <div className={styles.PanelLayout}>
      <main className={styles.Panel}>
        <section className={styles.Content}>
          {isSectionAllowed("data") &&
            activeSection === "data" &&
            renderDataSection()}

          {isSectionAllowed("user&pass") && activeSection === "user&pass" && (
            <UserAndPass />
          )}

          {isSectionAllowed("cupons") && activeSection === "cupons" && (
            <UserCoupons />
          )}

          {isSectionAllowed("donations") && activeSection === "donations" && (
            <HistorialDonacionUsuario />
          )}
        </section>

        <MyAccount onChangeSection={setActiveSection} />
      </main>
    </div>
  );
}
