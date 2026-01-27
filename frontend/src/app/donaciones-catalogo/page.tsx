"use client";

import { useEffect, useState } from "react";
import { BaseApi } from "@/API/baseApi";
import type { Donation } from "@/API/types/donaciones";
import styles from "@/styles/donar.module.css";

const ITEMS_PER_PAGE = 3;

export default function DonacionesCatalogoPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const api = new BaseApi();
        const data = await api.donation.getAll();
        setDonations(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las donaciones");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const filteredDonations = donations.filter((donation) => {
    const value = search.toLowerCase();
    return (
      donation.titulo.toLowerCase().includes(value) ||
      donation.detalle.toLowerCase().includes(value)
    );
  });

  const totalPages = Math.ceil(filteredDonations.length / ITEMS_PER_PAGE);

  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return <p className={styles.loading}>Cargando donaciones...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Donar</h1>
          <p className={styles.subtitle}>
            Elegí una donación y ayudá a generar un impacto real
          </p>
        </header>

        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.search}
            placeholder="Buscar donación..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className={styles.grid}>
          {paginatedDonations.length > 0 ? (
            paginatedDonations.map((donation) => (
              <article key={donation.id} className={styles.card}>
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{donation.titulo}</h2>

                  <p className={styles.description}>
                    {donation.detalle}
                  </p>

                  <div className={styles.meta}>
                    <span>
                      <strong>Tipo:</strong> {donation.tipo}
                    </span>
                    <span>
                      <strong>Cantidad:</strong> {donation.cantidad}
                    </span>
                  </div>
                </div>

                <button className={styles.button}>
                  Ver más información
                </button>
              </article>
            ))
          ) : (
            <p className={styles.noResults}>
              No se encontraron donaciones
            </p>
          )}
        </div>

        {filteredDonations.length > 0 && totalPages > 1 && (
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
