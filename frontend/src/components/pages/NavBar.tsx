'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../../styles/navbar.module.css"
import {
    FaFacebookF,
    FaInstagram,
    FaXTwitter,
    FaYoutube,
    FaLinkedinIn,
} from "react-icons/fa6";

const Navbar: React.FC = () => {

    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.logoSection} onClick={() => handleNavigation("/")}>
                <Image
                    src="/logos/SolidApp_logo.svg"
                    alt="Logo SolidAPP"
                    width={214}
                    height={88}
                    className={styles.logo}
                />
            </div>

            <ul className={styles.navLinks}>
                <li>
                    <Link href="/quienes-somos">Quiénes somos</Link>
                </li>
                <li>
                    <Link href="/que-hacemos">Qué hacemos ▾</Link>
                </li>
                <li>
                    <Link href="/como-participar">Cómo participar</Link>
                </li>
                <li>
                    <Link href="/novedades">Novedades</Link>
                </li>
                <li>
                    <Link href="/formacion">Formación</Link>
                </li>
            </ul>

            <div className={styles.actions}>
                <button
                    className={styles.donateBtn}
                    onClick={() => handleNavigation("/donar")}
                >
                    Donar aquí
                </button>

                <div className={styles.socialIcons}>
                    <Link href="https://www.facebook.com" target="_blank">
                        <FaFacebookF />
                    </Link>
                    <Link href="https://www.instagram.com" target="_blank">
                        <FaInstagram />
                    </Link>
                    <Link href="https://twitter.com" target="_blank">
                        <FaXTwitter />
                    </Link>
                    <Link href="https://youtube.com" target="_blank">
                        <FaYoutube />
                    </Link>
                    <Link href="https://linkedin.com" target="_blank">
                        <FaLinkedinIn />
                    </Link>
                </div>

                <button
                    className={styles.searchIcon}
                    onClick={() => alert("Buscar función próximamente")}
                >
                    🔍
                </button>
            </div>
        </nav>
    );
};

export default Navbar;