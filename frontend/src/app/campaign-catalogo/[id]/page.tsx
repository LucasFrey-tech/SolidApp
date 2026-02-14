import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/Donar/donarDetalle.module.css";

export default function DonacionDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const cause = mockCauses.find(
    (c) => c.id === Number(params.id)
  );

  if (!cause) return notFound();

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <img
          src={cause.image}
          alt={cause.title}
          className={styles.image}
        />

        <h1 className={styles.title}>{cause.title}</h1>
        <p className={styles.description}>
          {cause.description}
        </p>

        <p className={styles.content}>{cause.content}</p>

        <button className={styles.donateButton}>
          Donar ahora
        </button>

        {/* VOLVER */}
        <Link
          href="/campaign-catalogo"
          className={styles.backButton}
        >
          ← Volver al catálogo
        </Link>
      </section>
    </main>
  );
}
