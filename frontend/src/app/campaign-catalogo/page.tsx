"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/Donar/donar.module.css";
import { Campaign } from "@/API/types/campañas/campaigns";
import { baseApi } from "@/API/baseApi";

const ITEMS_PER_PAGE = 6;

export default function CampaignsCatalogoPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const campaignsRes = await baseApi.campaign.getAllPaginated(
          currentPage,
          ITEMS_PER_PAGE,
        );

        setCampaigns(campaignsRes.items);
        setTotal(campaignsRes.total);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las campañas");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  /* ===== LOADING ===== */
  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Cargando campañas...</p>
      </main>
    );
  }

  /* ===== ERROR ===== */
  if (error) {
    return (
      <main className={styles.page}>
        <section className={styles.container}>
          <div className={styles.noResults}>{error}</div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Donaciones</h1>
          <p className={styles.subtitle}>
            Elegí una campaña y colaborá con una causa
          </p>
        </header>

        <div className={styles.grid}>
          {campaigns.length === 0 ? (
            <div className={styles.noResults}>
              No hay campañas disponibles ahora
            </div>
          ) : (
            campaigns.map((campaign) => (
              <article key={campaign.id} className={styles.card}>
                {campaign.imagenPortada && (
                  <div className={styles.imageWrapper}>
                    <Image
                      src={campaign.imagenPortada}
                      alt={campaign.titulo}
                      fill
                      className={styles.image}
                    />
                  </div>
                )}

                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{campaign.titulo}</h2>

                  <p className={styles.description}>{campaign.descripcion}</p>

                  <div className={styles.meta}>
                    <span>Objetivo: {campaign.objetivo}</span>
                  </div>
                </div>

                <Link
                  href={`/campaign-catalogo/${campaign.id}`}
                  className={styles.button}
                >
                  Ver más información
                </Link>
              </article>
            ))
          )}
        </div>

        {totalPages > 1 && (
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
