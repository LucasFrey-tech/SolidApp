"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../../styles/login.module.css";
import modalStyles from "../../styles/modal.module.css";

export default function Auth() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<
    "usuario" | "empresa" | "organizacion" | null
  >(null);

  const router = useRouter();

  const handleOpen = (tipo: "usuario" | "empresa" | "organizacion") => {
    setSelectedType(tipo);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSelectedType(null);
  };

  return (
    <>
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
            />
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className={styles.rightPanel}>
          <button className={styles.closeButton} onClick={() => router.push("/")}>
            ✕
          </button>

          <div className={styles.formBox}>

            {/* TABS */}
            <div className={styles.tabButtons}>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "login" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("login")}
              >
                Iniciar sesión
              </button>

              <button
                className={`${styles.tabButton} ${
                  activeTab === "register" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("register")}
              >
                Registrarme
              </button>
            </div>

            {/* LOGIN */}
            {activeTab === "login" ? (
              <form className={styles.form}>
                <input type="email" placeholder="Correo electrónico" className={styles.input} />
                <div className={styles.passwordWrapper}>
                  <input type="password" placeholder="Contraseña" className={styles.input} />
                  <span className={styles.eyeIcon}>👁️</span>
                </div>
                <button type="submit" className={styles.submitButton}>
                  Iniciar sesión
                </button>
                <a href="#" className={styles.forgotPassword}>Olvidé mi contraseña</a>
              </form>
            ) : (
              /* REGISTRO */
              <>
                <h2 className={styles.tituloTipo}>
                  ¿Qué tipo de usuario desea registrarse?
                </h2>

                <div className={styles.contenedor}>
                  <button className={styles.item} onClick={() => handleOpen("usuario")}>
                    <Image src="/Registro/Donador_Registro.svg" alt="usuario" 
                    width={80} height={80} 
                    className={styles.imagen}/>
                    <p className={styles.label}>Usuario</p>
                  </button>

                  <button className={styles.item} onClick={() => handleOpen("empresa")}>
                    <Image src="/Registro/Empresa_registro.svg" alt="empresa" 
                    width={80} height={80} 
                    className={styles.imagen}/>

                    <p className={styles.label}>Empresa</p>
                  </button>

                  <button className={styles.item} onClick={() => handleOpen("organizacion")}>
                    <Image src="/Registro/Organizacion_Registro.svg" alt="org" 
                    width={80} height={80} 
                    className={styles.imagen}/>
                    <p className={styles.label}>Organización</p>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL PERSONALIZADO */}
      {open && (
        <div className={modalStyles.overlay}>
          <div className={modalStyles.modal}>

            <button className={modalStyles.closeBtn} onClick={closeModal}>
              ✕
            </button>

            <h2 className={modalStyles.title}>
              {selectedType === "usuario" && "Registro de Usuario"}
              {selectedType === "empresa" && "Registro de Empresa"}
              {selectedType === "organizacion" && "Registro de Organización"}
            </h2>

            {/* FORMULARIOS DINÁMICOS */}

            {selectedType === "usuario" && (
              <form className={modalStyles.form}>
                <input placeholder="Correo" className={modalStyles.input}/>
                <input placeholder="Clave" className={modalStyles.input}/>
                <input placeholder="Nombre" className={modalStyles.input}/>
                <input placeholder="Apellido" className={modalStyles.input}/>
                <button className={modalStyles.submitBtn}>Registrarme</button>
              </form>
            )}

            {selectedType === "empresa" && (
              <form className={modalStyles.form}>
                <input placeholder="Número de documento" className={modalStyles.input}/>
                <input placeholder="Razón Social" className={modalStyles.input}/>
                <input placeholder="Nombre Fantasía" className={modalStyles.input}/>
                <input placeholder="Teléfono" className={modalStyles.input}/>
                <input placeholder="Dirección" className={modalStyles.input}/>
                <input placeholder="Web (opcional)" className={modalStyles.input}/>
                <button className={modalStyles.submitBtn}>Registrarme</button>
              </form>
            )}

            {selectedType === "organizacion" && (
              <form className={modalStyles.form}>
                <input placeholder="Número de documento" className={modalStyles.input}/>
                <input placeholder="Razón Social" className={modalStyles.input}/>
                <input placeholder="Nombre Fantasía" className={modalStyles.input}/>
                <input placeholder="Teléfono" className={modalStyles.input}/>
                <input placeholder="Dirección" className={modalStyles.input}/>
                <input placeholder="Web (opcional)" className={modalStyles.input}/>
                <button className={modalStyles.submitBtn}>Registrarme</button>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}
