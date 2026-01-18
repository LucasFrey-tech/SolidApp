"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "@/styles/navbar.module.css";

interface UserInfo {
  email: string;
  type?: string;
}

export default function Navbar() {
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
    window.addEventListener("storage", checkAuthStatus);
    return () => window.removeEventListener("storage", checkAuthStatus);
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      setUserInfo(null);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setIsLoggedIn(true);
      setUserInfo({ email: payload.email });
    } catch {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserInfo(null);
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

  if (!mounted) return null;

  return (
    <nav className={styles.navbar}>
      {/* LOGO */}
      <div className={styles.logoSection}>
        <Image
          src="/logos/SolidApp_logo.svg"
          alt="Logo SolidApp"
          width={200}
          height={150}
          priority
        />
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
        className={`${styles.navLinks} ${
          menuOpen ? styles.navLinksOpen : ""
        }`}
      >
        <li><Link href="/" onClick={() => setMenuOpen(false)}>Inicio</Link></li>
        <li><Link href="/tienda" onClick={() => setMenuOpen(false)}>Tienda</Link></li>
        <li><Link href="/novedades" onClick={() => setMenuOpen(false)}>Novedades</Link></li>
        <li><Link href="/como-participar" onClick={() => setMenuOpen(false)}>Cómo participar</Link></li>
        <li><Link href="/quienes-somos" onClick={() => setMenuOpen(false)}>Quiénes somos</Link></li>
      </ul>

      {/* ACCIÓN DERECHA */}
      {!isLoggedIn ? (
        <Link href="/login" className={styles.loginButton}>
          Iniciar sesión
        </Link>
      ) : (
        <div
          ref={profileRef}
          className={styles.profileWrapper}
        >
          <button
            className={styles.profileButton}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            👤 {userInfo?.email.split("@")[0]}
          </button>

          <div
            className={`${styles.profileDropdown} ${
              profileOpen ? styles.open : ""
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
