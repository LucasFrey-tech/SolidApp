"use client";

import { useState } from "react";
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

const ITEMS_PER_PAGE = 3;

export default function DonacionesCatalogoPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCauses = mockCauses.filter((cause) => {
    const value = search.toLowerCase();
    return (
      cause.title.toLowerCase().includes(value) ||
      cause.description.toLowerCase().includes(value)
    );
  });

  const totalPages = Math.ceil(filteredCauses.length / ITEMS_PER_PAGE);

  const paginatedCauses = filteredCauses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Donar</h1>
          <p className={styles.subtitle}>
            Elegí una causa y ayudá a generar un impacto real
          </p>
        </header>

        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.search}
            placeholder="Buscar causa para donar..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className={styles.grid}>
          {paginatedCauses.length > 0 ? (
            paginatedCauses.map((cause) => (
              <article key={cause.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img src={cause.image} alt={cause.title} />
                </div>

                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{cause.title}</h2>
                  <p className={styles.description}>{cause.description}</p>
                </div>

                <button className={styles.button}>
                  Ver más información
                </button>
              </article>
            ))
          ) : (
            <p className={styles.noResults}>No se encontraron resultados</p>
          )}
        </div>

        {filteredCauses.length > 0 && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              ←
            </button>

            <span className={styles.pageInfo}>
              Página {currentPage} de {totalPages}
            </span>

            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              →
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
