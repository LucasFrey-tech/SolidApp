import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/donarDetalle.module.css";

const mockCauses = [
  {
    id: 1,
    title: "Comedor Comunitario",
    description: "Ayudá a que más familias puedan acceder a una comida diaria.",
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    content:
      "Este comedor brinda desayuno, almuerzo y merienda todos los días a familias que lo necesitan.",
  },
  {
    id: 2,
    title: "Refugio de Animales",
    description:
      "Donaciones destinadas a rescate, alimento y atención veterinaria.",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
    content:
      "El refugio cuida y rehabilita animales abandonados y heridos.",
  },
  {
    id: 3,
    title: "Educación Solidaria",
    description:
      "Apoyá a estudiantes con útiles, becas y materiales educativos.",
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350",
    content:
      "Ayudamos a que más chicos puedan seguir estudiando y formándose.",
  },
];

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
          href="/donaciones-catalogo"
          className={styles.backButton}
        >
          ← Volver al catálogo
        </Link>
      </section>
    </main>
  );
}
