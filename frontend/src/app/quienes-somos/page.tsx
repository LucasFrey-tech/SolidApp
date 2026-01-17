import styles from "@/styles/sobre-solidapp.module.css";
import {
  FaPeopleCarryBox,
  FaListCheck,
  FaCoins,
  FaStore,
} from "react-icons/fa6";

export default function SobreSolidApp() {
  return (
    <main className={styles.container}>

      {/* ========== HERO GENERAL ========== */}
      <section className={styles.hero}>
        <h1>SolidApp</h1>
        <p>
          Creemos que la solidaridad puede potenciarse a través de la tecnología,
          conectando personas con causas reales y generando impacto social verdadero.
        </p>
      </section>

      {/* ========== QUIÉNES SOMOS ========== */}
      <section className={styles.infoGrid}>
        <article className={styles.infoCard}>
          <h2>Nuestra misión 🎯</h2>
          <p>
            Facilitar y promover acciones solidarias conectando personas,
            organizaciones y comunidades, haciendo que ayudar sea simple,
            accesible y transparente.
          </p>
        </article>

        <article className={styles.infoCard}>
          <h2>Nuestra visión 👁️</h2>
          <p>
            Construir una comunidad comprometida donde la ayuda social forme
            parte de la vida cotidiana, generando cambios sostenibles a largo plazo.
          </p>
        </article>

        <article className={styles.infoCard}>
          <h2>Qué nos motiva 🤝</h2>
          <p>
            Transformar pequeñas acciones en grandes impactos, usando la
            tecnología como puente entre la solidaridad y la acción concreta.
          </p>
        </article>
      </section>

      {/* ========== QUÉ HACEMOS ========== */}
      <section className={styles.stepsSection}>
        <h2 className={styles.sectionTitle}>¿Cómo funciona SolidApp?</h2>

        <div className={styles.stepsGrid}>
          <article className={styles.stepCard}>
            <div className={styles.icon}>
              <FaPeopleCarryBox />
            </div>
            <h3>Detectamos necesidades</h3>
            <p>
              Las organizaciones cargan los recursos que necesitan para su
              funcionamiento diario.
            </p>
          </article>

          <article className={styles.stepCard}>
            <div className={styles.icon}>
              <FaListCheck />
            </div>
            <h3>Elegís qué donar</h3>
            <p>
              Desde la app seleccionás fácilmente los productos que querés donar,
              con total transparencia.
            </p>
          </article>

          <article className={styles.stepCard}>
            <div className={styles.icon}>
              <FaCoins />
            </div>
            <h3>Sumás puntos</h3>
            <p>
              Cada donación suma puntos solidarios como reconocimiento a tu
              compromiso.
            </p>
          </article>

          <article className={styles.stepCard}>
            <div className={styles.icon}>
              <FaStore />
            </div>
            <h3>Canjeás recompensas</h3>
            <p>
              Usá tus puntos para canjear cupones o productos disponibles en la
              tienda.
            </p>
          </article>
        </div>
      </section>

      {/* ========== CIERRE ========== */}
      <section className={styles.closing}>
        <h3>Un pequeño gesto puede generar un gran impacto</h3>
        <p>
          SolidApp transforma la solidaridad en una experiencia accesible,
          clara y con beneficios para quienes deciden ayudar.
        </p>
      </section>

    </main>
  );
}
