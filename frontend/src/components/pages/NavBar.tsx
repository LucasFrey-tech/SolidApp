'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import styles from "../../styles/navbar.module.css";

interface UserInfo {
  email: string;
  type: string;
}

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
    
    window.addEventListener('storage', checkAuthStatus);
    return () => window.removeEventListener('storage', checkAuthStatus);
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");
    const userEmail = localStorage.getItem("user_email");
    
    if (token && userType && userEmail) {
      setIsLoggedIn(true);
      setUserInfo({ email: userEmail, type: userType });
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_type");
    localStorage.removeItem("user_email");
    setIsLoggedIn(false);
    setUserInfo(null);
    setDropdownOpen(false);
    router.push("/inicio");
  };

  const handleNavigation = (path: string) => {
    setMenuOpen(false);
    setDropdownOpen(false);
    router.push(path);
  };

  if (!mounted) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoSection} onClick={() => handleNavigation("/")}>
        <Image
          src="/logos/SolidApp_logo.svg"
          alt="Logo SolidAPP"
          width={180}
          height={70}
          priority
        />
      </div>

      <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
        <li><Link href="/">Inicio</Link></li>
        <li><Link href="/tienda">Tienda</Link></li>
        <li><Link href="/novedades">Novedades</Link></li>
        <li><Link href="/como-participar">Cómo participar</Link></li>
        <li><Link href="/quienes-somos">Quiénes somos</Link></li>         

        {isLoggedIn && userInfo && (
          <li className={`${styles.mobileActions} ${styles.mobileUserInfo}`}>
            <div className={styles.userDisplayMobile}>
              {/* Opción 1: Emoji */}
              <span className={styles.icon}>👤</span>
              {/* Opción 2: SVG si tienes */}
              {/* <Image src="/icons/user.svg" alt="Usuario" width={20} height={20} /> */}
              <span className={styles.userName}>
                {userInfo.email.split('@')[0]}
              </span>
              <button className={styles.logoutBtnMobile} onClick={handleLogout}>
                🚪
              </button>
            </div>
          </li>
        )}

        {!isLoggedIn && (
          <li className={styles.mobileActions}>
            <button className={styles.donateBtn} onClick={() => handleNavigation("/donaciones-catalogo")}>
              Donar aquí
            </button>
            <button className={styles.loginBtn} onClick={() => handleNavigation("/login")}>
              Ingresar
            </button>
          </li>
        )}
      </ul>

      <div className={styles.actions}>
        <button className={styles.donateBtn} onClick={() => handleNavigation("/donaciones-catalogo")}>
          Donar aquí
        </button>

        {isLoggedIn && userInfo ? (
          <div className={styles.userSection}>
            <div 
              className={styles.userDisplay}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {/* Icono de usuario */}
              <span className={styles.icon}>👤</span>
              {/* <Image src="/icons/user.svg" alt="Usuario" width={20} height={20} /> */}
              
              <span className={styles.userName}>
                {userInfo.email.split('@')[0]}
              </span>
              <span className={styles.userType}>
                ({userInfo.type})
              </span>
            </div>
            
            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownItem}>
                  <Link href={`/dashboard/${userInfo.type}`} onClick={() => setDropdownOpen(false)}>
                    Mi perfil
                  </Link>
                </div>
                <div className={styles.dropdownItem}>
                  <Link href="/configuracion" onClick={() => setDropdownOpen(false)}>
                    Configuración
                  </Link>
                </div>
                <div className={styles.dropdownDivider}></div>
                <div className={styles.dropdownItem}>
                  <button className={styles.logoutBtn} onClick={handleLogout}>
                    <span className={styles.icon}>🚪</span>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button className={styles.loginBtn} onClick={() => handleNavigation("/login")}>
            Ingresar
          </button>
        )}
      </div>
    </nav>
  );
}