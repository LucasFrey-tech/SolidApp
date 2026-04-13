'use client'

import React from 'react'
import Link from 'next/link'
import styles from '@/styles/Colaborar/colaborar.module.css'

export default function ColaborarPage() {
  return (
    <main className={styles.container}>
      {/* HERO */}
      <section className={styles.hero}>
        <h1 className={styles.title}>Sumate a SolidApp</h1>
        <p className={styles.subtitle}>
          Si sos una organización o una empresa, podés formar parte de este proyecto
          y ayudarnos a generar un impacto real en la comunidad.
        </p>

        <a href="mailto:solidapp@gmail.com" className={styles.heroButton}>
          Contactanos
        </a>
      </section>

      {/* ORGANIZACIONES Y EMPRESAS */}
      <section className={styles.cardsSection}>
        <div className={`${styles.card} ${styles.cardOrganizacion}`}>
          <span className={styles.cardBadge}>Organización</span>
          <h2 className={styles.cardTitle}>Para organizaciones</h2>
          <p className={styles.cardText}>
            Si representás una organización, en SolidApp podés dar visibilidad a tus
            campañas y conectar con personas interesadas en colaborar mediante donaciones.
          </p>
          <ul className={styles.list}>
            <li>Publicar campañas solidarias</li>
            <li>Recibir apoyo de la comunidad</li>
            <li>Dar mayor visibilidad a tus causas</li>
          </ul>
        </div>

        <div className={`${styles.card} ${styles.cardEmpresa}`}>
          <span className={styles.cardBadge}>Empresa</span>
          <h2 className={styles.cardTitle}>Para empresas</h2>
          <p className={styles.cardText}>
            Si sos una empresa, podés colaborar ofreciendo beneficios o premios que
            incentiven la participación de los usuarios y fortalezcan el impacto del proyecto.
          </p>
          <ul className={styles.list}>
            <li>Aportar beneficios o premios</li>
            <li>Impulsar la participación solidaria</li>
            <li>Asociar tu marca a una causa positiva</li>
          </ul>
        </div>
      </section>

      {/* CÓMO SUMARTE */}
      <section className={styles.stepsSection}>
        <h2 className={styles.sectionTitle}>¿Cómo podés sumarte?</h2>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>1</span>
            <h3 className={styles.stepTitle}>Escribinos</h3>
            <p className={styles.stepText}>
              Contactanos por mail para contarnos quién sos y cómo te gustaría participar.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>2</span>
            <h3 className={styles.stepTitle}>Contanos tu propuesta</h3>
            <p className={styles.stepText}>
              Indicá si sos una organización o empresa y de qué manera querés colaborar.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>3</span>
            <h3 className={styles.stepTitle}>Coordinamos juntos</h3>
            <p className={styles.stepText}>
              Evaluamos la mejor forma de integrarte a SolidApp y empezar a trabajar en conjunto.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section className={styles.contactSection}>
        <h2 className={styles.sectionTitle}>Contacto</h2>
        <p className={styles.contactText}>
          Si querés formar parte de SolidApp, escribinos a:
        </p>

        <a href="mailto:solidapp@gmail.com" className={styles.mailLink}>
          solidapp@gmail.com
        </a>

        <div className={styles.backContainer}>
          <Link href="/" className={styles.backButton}>
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  )
}