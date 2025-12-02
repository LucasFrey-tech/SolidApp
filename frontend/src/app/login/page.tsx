"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Login from "@/components/Login/Login";
import Registro from "@/components/Registro/Registro";

// asegúrate de que este archivo exista en src/styles/login.module.css
import styles from "@/styles/login.module.css";

export default function LogInPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* PANEL IZQUIERDO */}
      <div className={styles.leftPanel}>
        <div className={styles.logoWrapper}>
          <Image
            src="/logos/SolidApp_sqr_logo.svg"
            alt="Logo SolidApp"
            width={600}
            height={600}
            className={styles.logo}
            priority
          />
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className={styles.rightPanel}>
        <button
          className={styles.closeButton}
          onClick={() => router.push("/")}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className={styles.formBox}>
          {/* TABS */}
          <div className={styles.tabButtons}>
            <button
              className={`${styles.tabButton} ${activeTab === "login" ? styles.active : ""}`}
              onClick={() => setActiveTab("login")}
              type="button"
            >
              Iniciar sesión
            </button>

            <button
              className={`${styles.tabButton} ${activeTab === "register" ? styles.active : ""}`}
              onClick={() => setActiveTab("register")}
              type="button"
            >
              Registrarme
            </button>
          </div>

          {/* CONTENIDO */}
          <div className={styles.contentArea}>
            {activeTab === "login" && <Login />}
            {activeTab === "register" && <Registro />}
          </div>
        </div>
      </div>
    </div>
  );
}
