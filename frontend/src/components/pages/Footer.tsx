'use client'

import Image from 'next/image'
import Link from 'next/link'
import styles from '../../styles/footer.module.css'

type FooterLink = {
  label: string
  href: string
}

export default function Footer() {
  const siteMapLinks: FooterLink[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Donar', href: '/campaign-catalogo' },
    { label: 'Tienda', href: '/tienda' },
    { label: 'Ranking', href: '/ranking' },
    { label: 'Cómo participar', href: '/como-participar' },
  ]

  const legalLinks: FooterLink[] = [
    { label: 'Políticas de privacidad', href: '/privacy' },
    { label: 'Términos y condiciones', href: '/terms' },
  ]

  const contactLinks: FooterLink[] = [
    { label: 'Contacto', href: 'mailto:solidapp@gmail.com' },
    { label: 'Alianzas', href: '/colaborar' },
  ]

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.backgroundSvg} aria-hidden="true">
        <Image
          src="/logos/FooterLogoSolidApp.svg"
          alt=""
          fill
          priority
          className={styles.backgroundImage}
        />
      </div>

      <div className={styles.content}>
        <section className={styles.brand}>
          <Link href="/" className={styles.brandLink}>
            <div className={styles.logoBox}>
              <Image
                src="/logos/SolidAppLogoS.svg"
                alt="SolidApp logo"
                width={42}
                height={42}
              />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>SolidApp</span>
              <span className={styles.brandTagline}>Solidaridad + tecnología</span>
            </div>
          </Link>

          <p className={styles.description}>
            En SolidApp conectamos personas, organizaciones y empresas para transformar
            la solidaridad en acciones concretas. Creemos en una comunidad más justa,
            participativa y comprometida.
          </p>

          <div className={styles.contactBlock}>
            <span className={styles.contactLabel}>Contacto</span>
            <a href="mailto:solidapp@gmail.com" className={styles.contactMail}>
              solidapp@gmail.com
            </a>
          </div>

          <nav aria-label="Redes sociales" className={styles.socials}>
            <Link href="#" aria-label="X">
              X
            </Link>
            <Link href="#" aria-label="LinkedIn">
              LinkedIn
            </Link>
            <Link href="#" aria-label="Instagram">
              Instagram
            </Link>
            <Link href="#" aria-label="Facebook">
              Facebook
            </Link>
          </nav>

          <button
            onClick={handleBackToTop}
            className={styles.backToTop}
            aria-label="Volver arriba"
          >
            ↑ Volver arriba
          </button>
        </section>

        <nav aria-label="Navegación principal" className={styles.linksColumn}>
          <h4>Navegación</h4>
          <ul>
            {siteMapLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Colaboración y contacto" className={styles.linksColumn}>
          <h4>Participación</h4>
          <ul>
            {contactLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal" className={styles.linksColumn}>
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
        <span>© 2026 SolidApp. Todos los derechos reservados.</span>
      </div>
    </footer>
  )
}