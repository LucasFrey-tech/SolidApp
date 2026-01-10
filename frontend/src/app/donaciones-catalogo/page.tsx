import styles from "@/styles/donar.module.css";

const mockCauses = [
  {
    id: 1,
    title: "Comedor Comunitario",
    description: "Ayudá a que más familias puedan acceder a una comida diaria.",
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
  },
  {
    id: 2,
    title: "Refugio de Animales",
    description:
      "Donaciones destinadas a rescate, alimento y atención veterinaria.",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
  },
  {
    id: 3,
    title: "Educación Solidaria",
    description:
      "Apoyá a estudiantes con útiles, becas y materiales educativos.",
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350",
  },
];

export default function DonacionesCatalogoPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Donar aquí</h1>

        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.search}
            placeholder="Buscar causa para donar..."
          />
        </div>

        <div className={styles.grid}>
          {mockCauses.map((cause) => (
            <div key={cause.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img src={cause.image} alt={cause.title} />
              </div>

              <h2 className={styles.cardTitle}>{cause.title}</h2>
              <p className={styles.description}>{cause.description}</p>

              <button className={styles.button}>Mas información</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
