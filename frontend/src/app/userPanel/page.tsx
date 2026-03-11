// Panel.tsx
"use client";

import { useState } from "react";
import styles from "@/styles/UserPanel/userPanel.module.css";
import MyAccount from "@/components/pages/perfil/MyAccount";
import UserAndPass from "@/components/pages/perfil/User&Pass";
import UserData from "@/components/pages/data/userData";
import HistorialDonacionUsuario from "@/components/pages/perfil/historialDonacionUsuario";
import UserCoupons from "@/components/pages/perfil/cuponesUsuarios";
import { useUser } from "../context/UserContext";
import { useSearchParams } from "next/navigation";
import { GestionTipo } from "@/API/types/gestion/enum";
import GestionData from "@/components/pages/data/gestionData";

type Section = "data" | "user&pass" | "cupons" | "donations";

export default function Panel() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");

  const validSections: Section[] = ["data", "user&pass", "cupons", "donations"];
  const initialSection = validSections.includes(sectionParam as Section)
    ? (sectionParam as Section)
    : "data";

  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  const { user, loading } = useUser();

  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>No hay usuario</p>;

  return (
    <div className={styles.PanelLayout}>
      <main className={styles.Panel}>
        <section className={styles.Content}>
          {activeSection === "data" && (
            <>
              <UserData />
              {user.gestion === GestionTipo.EMPRESA && (
                <GestionData tipo={GestionTipo.EMPRESA} />
              )}
              {user.gestion === GestionTipo.ORGANIZACION && (
                <GestionData tipo={GestionTipo.ORGANIZACION} />
              )}
            </>
          )}
          {activeSection === "user&pass" && <UserAndPass />}
          {activeSection === "cupons" && <UserCoupons />}
          {activeSection === "donations" && <HistorialDonacionUsuario />}
        </section>

        <MyAccount onChangeSection={setActiveSection} />
      </main>
    </div>
  );
}
