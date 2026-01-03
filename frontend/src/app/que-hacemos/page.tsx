import styles from "@/styles/que-hacemos.module.css";
import {
  FaPeopleCarryBox,
  FaListCheck,
  FaCoins,
  FaStore
} from "react-icons/fa6";

export default function QueHacemos() {
  return (
    <main className={styles.container}>
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
        <h3>Un sistema simple para ayudar más</h3>
        <p>
          SolidApp transforma la solidaridad en una experiencia accesible,
          clara y con beneficios para quienes ayudan.
        </p>
      </section>
    </main>
  );
}
