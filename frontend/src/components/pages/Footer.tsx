'use client'

import Image from "next/image"
import Link from "next/link"
import styles from "../../styles/footer.module.css"

export default function Footer() {
    type FooterLink = {
        label: string;
        href: string;
    }

    const siteMapLinks: FooterLink[] = [
        { label: "Inicio", href: "/" },
        { label: "Novedades", href: "/novedades" },
        { label: "Formación", href: "/formacion" },
        { label: "Participá", href: "/como-participar" },
        { label: "Contacto", href: "/contacto" },
    ];

    const legalLinks: FooterLink[] = [
        { label: "Políticas de Privacidad", href: "/privacy" },
        { label: "Términos y Condiciones", href: "/terms" },
    ];

    const handleBackToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };


    return (
        <footer className={styles.footer}>
            <div className={styles.backgroundSvg} aria-hidden="true">
                <Image
                    src="/logos/FooterLogoSolidApp.svg"
                    alt="Footer background pattern"
                    fill
                    priority
                    className={styles.logo}
                />
            </div>
            <div className={styles.content}>
                <section className={styles.brand}>
                    <div className={styles.logo}>
                        <Image
                            src="/logos/SolidAppLogoS.svg"
                            alt="SolidApp logo"
                            width={40}
                            height={40}
                        />
                        <span>SolidAPP</span>
                    </div>

                    <p className={styles.description}>
                        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nulla sed ad voluptatem doloremque ullam commodi? Animi necessitatibus beatae doloremque explicabo nesciunt, nam a fugiat, voluptatum illum aliquam maiores perspiciatis quia.
                    </p>


                    <nav aria-label="Social media" className={styles.socials}>
                        <Link href="#" aria-label="X">X</Link>
                        <Link href="#" aria-label="LinkedIn">in</Link>
                        <Link href="#" aria-label="Instagram">IG</Link>
                        <Link href="#" aria-label="Facebook">fb</Link>
                    </nav>


                    <button
                        onClick={handleBackToTop}
                        className={styles.backToTop}
                        aria-label="Back to top"
                    >
                        ↑ Volver Arriba
                    </button>
                </section>

                <nav aria-label="Navegacion" className={styles.links}>
                    <h4>Navegacion</h4>
                    <ul>
                        {siteMapLinks.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href}>{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <nav aria-label="Legal links" className={styles.links}>
                    <h4>Legal</h4>
                    <ul>
                        {legalLinks.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href}>{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <div className={styles.bottomBar}>
                © 2026 SolidApp.com All Rights Reserved.
            </div>
        </footer>
    );
}