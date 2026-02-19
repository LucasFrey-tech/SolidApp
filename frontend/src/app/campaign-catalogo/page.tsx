"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/Donar/donar.module.css";
import { Campaign } from "@/API/types/campañas/campaigns";
import { CampaignEstado } from "@/API/types/campañas/enum";
import { BaseApi } from "@/API/baseApi";

const ITEMS_PER_PAGE = 6;

export default function CampaignsCatalogoPage() {

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  /* ===============================
     FETCH
  ============================== */
  useEffect(() => {

    const fetchData = async () => {

      try {

        setLoading(true);

        const api = new BaseApi();

        const res = await api.campaign.getAllPaginated(
          currentPage,
          ITEMS_PER_PAGE
        );

        //  FILTRAR PENDIENTES
        const activas = res.items.filter(
          c => c.estado !== CampaignEstado.PENDIENTE
        );

        setCampaigns(activas);

        setTotal(res.total);

      }
      catch (err) {

        console.error(err);

        setError("Error al cargar campañas");

      }
      finally {

        setLoading(false);

      }

    };

    fetchData();

  }, [currentPage]);

  /* ===============================
     SEARCH FILTER
  ============================== */
  useEffect(() => {

    if (!search.trim()) {

      setFilteredCampaigns(campaigns);

      return;

    }

    const s = search.toLowerCase();

    const filtered = campaigns.filter(c =>
      c.titulo.toLowerCase().includes(s) ||
      c.descripcion.toLowerCase().includes(s) ||
      c.organizacion.nombreFantasia.toLowerCase().includes(s)
    );

    setFilteredCampaigns(filtered);

  }, [search, campaigns]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  /* ===============================
     LOADING
  ============================== */
  if (loading) {

    return (

      <main className={styles.page}>
        <div className={styles.searchContainer}>
          <label className={styles.searchLabel}>
            Buscar campaña
          </label>

          <input
            type="text"
            placeholder="Ej: Donación de ropa"
            className={styles.searchInput}
          />
        </div>
        <p className={styles.loading}>
          Cargando campañas...
        </p>
      </main>
    );

  }
  /* ===============================
     ERROR
  ============================== */
  if (error) {

    return (
      <main className={styles.page}>
        <section className={styles.container}>
          <div className={styles.noResults}>
            {error}
          </div>
        </section>
      </main>
    );

  }

  return (

    <main className={styles.page}>

      <section className={styles.container}>


        {/* HEADER */}
        <header className={styles.header}>

          <h1 className={styles.title}>
            Donaciones
          </h1>

          <p className={styles.subtitle}>
            Elegí una campaña y colaborá con una causa
          </p>

          {/* SEARCH */}
          <div className={styles.searchContainer}>

            <label className={styles.searchLabel}>
              Buscar campaña
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => {

                setSearch(e.target.value);

                setCurrentPage(1);

              }}
              placeholder="Ej: alimentos, ropa..."
              className={styles.searchInput}
            />

          </div>

        </header>

        {/* GRID */}
        <div className={styles.grid}>

          {filteredCampaigns.length === 0 ? (

            <div className={styles.noResults}>
              No hay campañas disponibles
            </div>

          )
            :
            (filteredCampaigns.map((campaign) => (

              <article
                key={campaign.id}
                className={styles.card}
              >

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

                  <h2 className={styles.cardTitle}>
                    {campaign.titulo}
                  </h2>


                  <p className={styles.description}>
                    {campaign.descripcion}
                  </p>


                  <div className={styles.meta}>
                    Objetivo: {campaign.objetivo}
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



        {/* PAGINATION */}
        {totalPages > 1 && (

          <div className={styles.pagination}>


            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              ← Anterior

            </button>

            <span className={styles.pageInfo}>

              Página {currentPage} de {totalPages}

            </span>

            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              className={styles.pageButton}
            >

              Siguiente →

            </button>



          </div>

        )}


      </section>

    </main>

  );

}
