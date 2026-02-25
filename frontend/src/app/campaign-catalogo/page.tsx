"use client";

import { useEffect, useState, useDeferredValue } from "react";
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
  const [initialLoading, setInitialLoading] = useState(true); // Solo para primera carga
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await baseApi.campaign.getAllPaginated(
          currentPage,
          ITEMS_PER_PAGE,
          deferredSearch
        );
        setCampaigns(res.items);
        setTotal(res.total);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Error al cargar campañas");
        setCampaigns([]);
        setTotal(0);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [currentPage, deferredSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <main className={styles.page}>
      <section className={styles.container}>

        {/* HEADER */}
        <header className={styles.header}>
          <h1 className={styles.title}>Donaciones</h1>
          <p className={styles.subtitle}>Elegí una campaña y colaborá con una causa</p>

          {/* SEARCH - Siempre visible y habilitado */}
          <div className={styles.searchContainer}>
            <label className={styles.searchLabel}>Buscar campaña</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ej: alimentos, ropa..."
              className={styles.searchInput}
            />
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.error}>{error}</p>
          </div>
        )}

        {/* PRIMERA CARGA - Solo se muestra la primera vez */}
        {initialLoading ? (
          <p className={styles.loading}>Cargando campañas...</p>
        ) : (
          <>
            {/* GRID */}
            {campaigns.length > 0 ? (
              <div className={styles.grid}>
                {campaigns.map((campaign) => (
                  <article key={campaign.id} className={styles.card}>
                    {campaign.imagenPortada && (
                      <div className={styles.imageWrapper}>
                        <Image
                          src={campaign.imagenPortada}
                          alt={campaign.titulo}
                          fill
                          sizes="(max-width:768px) 100vw, 33vw"
                          className={styles.image}
                        />
                      </div>
                    )}

                    <div className={styles.cardContent}>
                      <h2 className={styles.cardTitle}>{campaign.titulo}</h2>
                      <p className={styles.description}>{campaign.descripcion}</p>
                      <div className={styles.meta}>Objetivo: {campaign.objetivo}</div>
                    </div>

                    <Link
                      href={`/campaign-catalogo/${campaign.id}`}
                      className={styles.button}
                    >
                      Ver más información
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              /* SIN RESULTADOS */
              <div className={styles.noResults}>
                {deferredSearch ? (
                  <>
                    <p>No hay campañas que coincidan con &quot;<strong>{deferredSearch}</strong>&ldquo;</p>
                    <button 
                      onClick={() => setSearch("")}
                      className={styles.clearSearchButton}
                    >
                      Limpiar búsqueda
                    </button>
                  </>
                ) : (
                  <p>No hay campañas disponibles</p>
                )}
              </div>
            )}

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  className={styles.pageButton}
                >
                  ←
                </button>

                <span className={styles.pageInfo}>
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  className={styles.pageButton}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}

      </section>
    </main>
  );
}