import styles from "@/styles/quienes-somos.module.css";

export default function QuienesSomos() {
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

      {/* CIERRE */}
      <section className={styles.closing}>
        <h3>Un pequeño gesto puede generar un gran impacto</h3>
        <p>
          SolidApp nace con el objetivo de transformar la forma en que ayudamos,
          usando la tecnología como un puente entre la solidaridad y la acción.
        </p>
      </section>
    </main>
  );
}
