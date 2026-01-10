'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "../../styles/navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigation = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  if (!mounted) return null; // 🔑 CLAVE

  return (
    <nav className={styles.navbar}>
      <div
        className={styles.logoSection}
        onClick={() => handleNavigation("/")}
      >
        <Image
          src="/logos/SolidApp_logo.svg"
          alt="Logo SolidAPP"
          width={180}
          height={70}
          priority
        />
      </div>

      <button
        className={styles.menuToggle}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
        <li><Link href="/quienes-somos">Quiénes somos</Link></li>
        <li><Link href="/que-hacemos">Qué hacemos</Link></li>
        <li><Link href="/como-participar">Cómo participar</Link></li>
        <li><Link href="/novedades">Novedades</Link></li>
        <li><Link href="/formacion">Formación</Link></li>

        <li className={styles.mobileActions}>
          <button
            className={styles.donateBtn}
            onClick={() => handleNavigation("/donaciones-catalogo")}
          >
            Donar aquí
          </button>

          <button
            className={styles.loginBtn}
            onClick={() => handleNavigation("/login")}
          >
            Ingresar
          </button>
        </li>
      </ul>

      <div className={styles.actions}>
        <button
          className={styles.donateBtn}
          onClick={() => handleNavigation("/donaciones-catalogo")}
        >
          Donar aquí
        </button>

        <button
          className={styles.loginBtn}
          onClick={() => handleNavigation("/login")}
        >
          Ingresar
        </button>
      </div>
    </nav>
  );
}
