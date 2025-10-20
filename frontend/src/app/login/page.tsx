"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../../styles/auth.module.css";

export default function Auth() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.logoWrapper}>
          <Image
            src="/logos/SolidApp_sqr_logo.png"
            alt="Logo SolidApp"
            width={400}
            height={400}
            className={styles.logo}
          />
        </div>
      </div>

      <div className={styles.rightPanel}>
        <button className={styles.closeButton} onClick={() => router.push("/")}>
          ✕
        </button>

        <div className={styles.formBox}>
          <div className={styles.tabButtons}>
            <button
              className={`${styles.tabButton} ${activeTab === "login" ? styles.active : ""
                }`}
              onClick={() => setActiveTab("login")}
            >
              Iniciar sesión
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "register" ? styles.active : ""
                }`}
              onClick={() => setActiveTab("register")}
            >
              Registrarme
            </button>
          </div>

          {activeTab === "login" ? (
            <form className={styles.form}>
              <input
                type="email"
                placeholder="Correo electrónico"
                className={styles.input}
              />
              <div className={styles.passwordWrapper}>
                <input
                  type="password"
                  placeholder="Contraseña"
                  className={styles.input}
                />
                <span className={styles.eyeIcon}>👁️</span>
              </div>
              <button type="submit" className={styles.submitButton}>
                Iniciar sesión
              </button>
              <a href="#" className={styles.forgotPassword}>
                Olvidé mi contraseña
              </a>
            </form>
          ) : (
            <form className={styles.form}>
              <div className={styles.nameRow}>
                <input
                  type="text"
                  placeholder="Nombre"
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  className={styles.input}
                />
              </div>
              <input
                type="email"
                placeholder="Correo electrónico"
                className={styles.input}
              />
              <div className={styles.passwordWrapper}>
                <input
                  type="password"
                  placeholder="Contraseña"
                  className={styles.input}
                />
                <span className={styles.eyeIcon}>👁️</span>
              </div>
              <div className={styles.passwordWrapper}>
                <input
                  type="password"
                  placeholder="Repetir contraseña"
                  className={styles.input}
                />
                <span className={styles.eyeIcon}>👁️</span>
              </div>
              <button type="submit" className={styles.submitButton}>
                Registrarme
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}