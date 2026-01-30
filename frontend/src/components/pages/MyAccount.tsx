"use client";

import styles from "@/styles/myAccountMenu.module.css";
import Image from "next/image";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

type AccountSection = "data" | "user&pass" | "cupons" | "donations";

type MyAccountProps = {
  readonly onChangeSection: (section: AccountSection) => void;
};

export default function MyAccount({ onChangeSection }: MyAccountProps) {
  const { user, setUser, loading } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/inicio");
    router.refresh();
  };

  return (
    <section className={styles.AccountMenu}>
      <main className={styles.MenuLayer}>
        <h1>Mi cuenta</h1>

        {/* PERFIL */}
        <div className={styles.User}>
          <Image src="/img/perfil.svg" alt="Usuario" width={48} height={48} />

          <div>
            <p className={styles.UserName}>
              {loading
                ? "Cargando..."
                : user
                  ? user.username || user.email?.split("@")[0] || "Usuario"
                  : "Invitado"}
            </p>

            <p className={styles.Email}>{user?.email}</p>
          </div>
        </div>

        {/* MENÚ */}
        <nav className={styles.Menu}>
          <ul className={styles.List}>
            {(user?.userType === 'usuario' || user?.userType === 'empresa') && (
              <li>
                <button onClick={() => {
                  if (user.userType === 'usuario') {
                    onChangeSection('cupons');
                  } else if (user.userType === 'empresa'){
                    router.push('/empresaPanel');
                  } 
                }}>
                  Mis Cupones
                </button>
              </li>
            )}

            <li>
              <button onClick={() => onChangeSection("data")}>Mis Datos</button>
            </li>

            <li>
              <button onClick={() => onChangeSection("user&pass")}>
                Usuario y Contraseña
              </button>
            </li>

            <li>
              <button onClick={() => onChangeSection("donations")}>
                Historial de Donaciones
              </button>
            </li>

            <li className={styles.Logout}>
              <button onClick={handleLogout}>Cerrar Sesión</button>
            </li>
          </ul>
        </nav>
      </main>
    </section>
  );
}
