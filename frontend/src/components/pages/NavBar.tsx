"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import styles from "@/styles/navbar.module.css";
import { BaseApi } from "@/API/baseApi";

export default function Navbar() {
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement | null>(null);
  const { user, setUser, loading } = useUser();

  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [points, setPoints] = useState<number | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    setUser(null);
    setProfileOpen(false);
    setMenuOpen(false);
    router.push("/inicio");
  };

  // cerrar dropdown al click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  //traer los puntos
  useEffect(() => {
    if (!user || user.userType !== "usuario") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const api = new BaseApi(token);

    api.users
      .getPoints(user.sub)
      .then((res) => {
        setPoints(res.puntos);
      })
      .catch((err) => {
        console.error("Error al obtener puntos:", err);
        setPoints(0);
      });
  }, [user]);


  if (loading) return null;

  return (
    <nav className={styles.navbar}>
      {/* LOGO */}
      <div className={styles.logoSection}>
        <Link href="/" aria-label="Ir al inicio">
          <Image
            src="/logos/SolidApp_logo.svg"
            alt="Logo SolidApp"
            width={200}
            height={150}
            priority
            style={{ cursor: "pointer" }}
          />
        </Link>
      </div>

      {/* HAMBURGER */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* LINKS */}
      <ul
        className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ""
          }`}
      >
        <li><Link href="/" onClick={() => setMenuOpen(false)}>Inicio</Link></li>
        <li><Link href="/donaciones-catalogo" onClick={() => setMenuOpen(false)}>Donar</Link></li>
        <li><Link href="/tienda" onClick={() => setMenuOpen(false)}>Tienda</Link></li>
        <li><Link href="/ranking" onClick={() => setMenuOpen(false)}>Ranking</Link></li>
        <li><Link href="/como-participar" onClick={() => setMenuOpen(false)}>Cómo participar</Link></li>
        <li><Link href="/quienes-somos" onClick={() => setMenuOpen(false)}>Quiénes somos</Link></li>
      </ul>

      {/* ACCIÓN DERECHA */}
      {!user ? (
        <Link href="/login" className={styles.loginButton}>
          Iniciar sesión
        </Link>
      ) : (
        <div ref={profileRef} className={styles.profileWrapper}>
          {user.userType === "organizacion" && (
            <div className={styles.points}>
              <Link href="/organizacionPanel" onClick={() => setMenuOpen(false)}>Papanel Organisazion</Link>
            </div>
          )}

          {user.userType === "usuario" && points !== null && (
            <div className={styles.points}>
              <span>{points}</span>
              <Image
                src="/img/img_coin.png"
                alt="Puntos del usuario"
                width={50}
                height={50}
                className={styles.pointsIcon}
              />
            </div>
          )}
          <button
            className={styles.profileButton}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <Image
              src="/img/perfil.svg"
              alt="Perfil de usuario"
              width={41}
              height={41}
              className={styles.profileIcon}
            />
            <span className={styles.profileName}>
              {user.username}
            </span>
          </button>

          <div
            className={`${styles.profileDropdown} ${profileOpen ? styles.open : ""
              }`}
          >
            <Link
              href="/userPanel"
              className={styles.dropdownItem}
              onClick={() => setProfileOpen(false)}
            >
              Mi cuenta
            </Link>

            <div className={styles.dropdownDivider} />

            <button
              className={styles.dropdownItem}
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
