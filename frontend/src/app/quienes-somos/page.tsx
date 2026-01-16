'use client';

import styles from "@/styles/quienes-somos.module.css";
import { FaCoins, FaListCheck, FaPeopleCarryBox, FaStore } from "react-icons/fa6";

export default function QuienesSomos() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className={styles.container}>
      {/* HERO */}
      <section className={styles.hero}>
        <h1>¿Quiénes somos?</h1>
        <p>
          En <strong>SolidApp</strong> creemos que la solidaridad puede potenciarse
          a través de la tecnología, conectando personas con causas reales y
          generando impacto social verdadero.
        </p>
      </section>

      {/* INFO */}
      <section className={styles.sections}>
        <article className={styles.card}>
          <h2>Nuestra misión 🎯</h2>
          <p>
            Facilitar y promover acciones solidarias conectando personas,
            organizaciones y comunidades, haciendo que ayudar sea simple,
            accesible y transparente.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Nuestra visión 👁️</h2>
          <p>
            Construir una comunidad comprometida donde la ayuda social forme
            parte de la vida cotidiana, generando cambios sostenibles a largo
            plazo.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Qué hacemos 🤝</h2>
          <p>
            A través de nuestra plataforma, los usuarios pueden donar,
            participar en campañas solidarias y recibir incentivos
            que fomentan el compromiso social.
          </p>
        </article>
      </section>

      {/* HERO */}
      <section className={styles.hero}>
        <h1>¿Qué hacemos?</h1>
        <p>
          En <strong>SolidApp</strong> conectamos personas solidarias con
          organizaciones que necesitan ayuda real, facilitando el proceso de
          donación y generando impacto social.
        </p>
      </section>

      {/* PASOS */}
      <section className={styles.steps}>
        <article className={styles.card}>
          <div className={styles.icon}>
            <FaPeopleCarryBox />
          </div>
          <h2>Detectamos necesidades</h2>
          <p>
            Las organizaciones cargan los recursos que necesitan para su
            funcionamiento diario.
          </p>
        </article>

        <article className={styles.card}>
          <div className={styles.icon}>
            <FaListCheck />
          </div>
          <h2>Elegís qué donar</h2>
          <p>
            Desde la app seleccionás fácilmente los productos que querés donar,
            con total transparencia.
          </p>
        </article>

        <article className={styles.card}>
          <div className={styles.icon}>
            <FaCoins />
          </div>
          <h2>Sumás puntos</h2>
          <p>
            Cada donación suma puntos solidarios como reconocimiento a tu
            compromiso.
          </p>
        </article>

        <article className={styles.card}>
          <div className={styles.icon}>
            <FaStore />
          </div>
          <h2>Canjeás recompensas</h2>
          <p>
            Usá tus puntos en la tienda para canjear cupones o productos
            disponibles.
          </p>
        </article>
      </section>

      {/* CIERRE */}
      <section className={styles.closing}>
        <h3>Un pequeño gesto puede generar un gran impacto</h3>
        <p>
          SolidApp nace con el objetivo de transformar la forma en que ayudamos,
          usando la tecnología como un puente entre la solidaridad y la acción.
        </p>
      </section>

      <section className={styles.closing}>
        <h3>Un sistema simple para ayudar más</h3>
        <p>
          SolidApp transforma la solidaridad en una experiencia accesible,
          clara y con beneficios para quienes ayudan.
        </p>
      </section>

      {/* BACK TO TOP BUTTON */}
      <div className={styles.backToTop}>
        <button onClick={scrollToTop}>
          Volver al principio
        </button>
      </div>
    </main>
  );
}
