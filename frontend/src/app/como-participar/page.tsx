import Link from "next/link";
import styles from "@/styles/como-participar/participar.module.css";

export default function Participar() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cómo participar en SolidApp</h1>
      <p className={styles.subtitle}>
        Seguí estos pasos para registrarte, donar y canjear beneficios dentro de la plataforma.
      </p>

      <div className={styles.features}>
        <div className={styles.featureCard}>
          <h3>Registrarse</h3>
          <p>
            Elegí el tipo de usuario (organización o donante), completá los campos requeridos y confirmá tu registro.
          </p>
          <Link href="/login" className={styles.button}>
            Ir a Registrarse
          </Link>
        </div>

        <div className={styles.featureCard}>
          <h3>Realizar donaciones</h3>
          <p>
            Ingresá a la sección “Donar”, seleccioná una campaña, detallá la donación y confirmá el envío.
          </p>
          <Link href="/campaign-catalogo" className={styles.button}>
            Ir a Donar
          </Link>
        </div>

        <div className={styles.featureCard}>
          <h3>Acumular puntos</h3>
          <p>
            Cada donación exitosa suma puntos que luego pueden ser canjeados por premios en la tienda.
          </p>
        </div>

        <div className={styles.featureCard}>
          <h3>Canjear beneficios</h3>
          <p>
            Entrá a la sección “Tienda”, seleccioná los cupones o premios, indicá la cantidad y confirmá el canje.
          </p>
          <Link href="/tienda" className={styles.button}>
            Ir a Tienda
          </Link>
        </div>

        <div className={styles.featureCard}>
          <h3>Consultar el ranking</h3>
          <p>
            Visualizá a los usuarios más activos y tomá referencia para aumentar tu participación en la comunidad.
          </p>
          <Link href="/ranking" className={styles.button}>
            Ver Ranking
          </Link>
        </div>
      </div>
    </div>
  );
}