"use client";

import styles from "@/styles/UserPanel/usuario/myAccountMenu.module.css";
import Image from "next/image";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { Rol } from "@/API/types/auth";
import { GestionTipo } from "@/API/types/gestion/enum";

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

  const puedeVerCupones = () => {
    if (!user) return false;
    if (user.rol === Rol.USUARIO) return true;
    if (user.rol === Rol.GESTOR && user.gestion === GestionTipo.EMPRESA)
      return true;
    return false;
  };

  const puedeVerDonaciones = () => {
    if (!user) return false;
    return user.rol === Rol.GESTOR && user.gestion === GestionTipo.ORGANIZACION;
  };

  const puedeVerData = () => {
    if (!user) return false;
    return user.rol !== Rol.ADMIN; // ADMIN no ve "Mis Datos"
  };

  const handleCuponesClick = () => {
    if (user?.rol === Rol.USUARIO) {
      onChangeSection("cupons");
    } else if (
      user?.rol === Rol.GESTOR &&
      user?.gestion === GestionTipo.EMPRESA
    ) {
      router.push("/empresaPanel");
    }
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
            <li>
              <button onClick={() => onChangeSection("user&pass")}>
                Usuario y Contraseña
              </button>
            </li>

            {/* Mis Datos - Visible para todos EXCEPTO ADMIN */}
            {puedeVerData() && (
              <li>
                <button onClick={() => onChangeSection("data")}>
                  Mis Datos
                </button>
              </li>
            )}

            {/* Mis Cupones - USUARIO o GESTOR con gestión EMPRESA */}
            {puedeVerCupones() && (
              <li>
                <button onClick={handleCuponesClick}>Mis Cupones</button>
              </li>
            )}

            {/* Historial de Donaciones - Solo GESTOR con gestión ORGANIZACION */}
            {puedeVerDonaciones() && (
              <li>
                <button onClick={() => onChangeSection("donations")}>
                  Historial de Donaciones
                </button>
              </li>
            )}

            <li className={styles.Logout}>
              <button onClick={handleLogout}>Cerrar Sesión</button>
            </li>
          </ul>
        </nav>
      </main>
    </section>
  );
}
