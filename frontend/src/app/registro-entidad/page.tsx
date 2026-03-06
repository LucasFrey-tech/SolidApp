"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import RegistroEntidades from "@/components/Registro/registroEntidades";

import styles from "@/styles/login-registro/login.module.css";

export default function RegistroEntidadesPage() {
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
          <RegistroEntidades />
        </div>

      </div>
    </div>
  );
}