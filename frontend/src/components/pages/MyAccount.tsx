'use client';

import styles from "@/styles/myAccountMenu.module.css";
import Image from "next/image";
import { useUser } from "@/app/context/UserContext";

type MyAccountProps = {
  readonly onChangeSection: (section: 'data' | 'user&pass' | 'cupons') => void;
};

export default function MyAccount({ onChangeSection }: MyAccountProps) {
  const { user } = useUser();

  return (
    <section className={styles.AccountMenu}>
      <main className={styles.MenuLayer}>
        <h1>Mi cuenta</h1>

        {/* PERFIL */}
        <div className={styles.User}>
          <Image
            src="/logos/user_logo.svg"
            alt="Usuario"
            width={48}
            height={48}
          />

          <div>
            <p className={styles.UserName}>
              {user ? user.username || user.email.split("@")[0] : "Cargando..."}
            </p>

            <p className={styles.Email}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* MENÚ */}
        <nav className={styles.Menu}>
          <ul className={styles.List}>
            <li><button onClick={() => onChangeSection('cupons')}>Mis Cupones</button></li>
            <li><button onClick={() => onChangeSection('data')}>Mis Datos</button></li>
            <li><button onClick={() => onChangeSection('user&pass')}>Usuario y Contraseña</button></li>
            <li className={styles.Logout}><button>Cerrar Sesión</button></li>
          </ul>
        </nav>
      </main>
    </section>
  );
}
