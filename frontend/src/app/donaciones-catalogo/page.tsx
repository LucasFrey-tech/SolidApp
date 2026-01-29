"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/donar.module.css";
import { DonacionImagen, Donation } from "@/API/types/donaciones";
import { BaseApi } from "@/API/baseApi";

const ITEMS_PER_PAGE = 6;

export default function DonacionesCatalogoPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [images, setImages] = useState<DonacionImagen[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const api = new BaseApi();

        const [donationsRes, imagesRes] = await Promise.all([
          api.donation.getAllPaginated(currentPage, ITEMS_PER_PAGE),
          api.donation.getImages(),
        ]);

        setDonations(donationsRes.items);
        setTotal(donationsRes.total);
        setImages(imagesRes);
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

  const getImageByDonationId = (id: number) =>
    images.find((img) => img.id_donacion === id)?.imagen;

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
        <header className={styles.header}>
          <h1 className={styles.title}>Donaciones</h1>
          <p className={styles.subtitle}>
            Elegí una campaña y colaborá con una causa
          </p>
        </header>

        <div className={styles.grid}>
          {donations.length === 0 ? (
            <div className={styles.noResults}>
              No hay campañas disponibles ahora
            </div>
          ) : (
            donations.map((donation) => {
              const image = getImageByDonationId(donation.id);

              return (
                <article key={donation.id} className={styles.card}>
                  {image && (
                    <div className={styles.imageWrapper}>
                      <Image
                        src={image}
                        alt={donation.titulo}
                        fill
                        className={styles.image}
                      />
                    </div>
                  )}

                  <div className={styles.cardContent}>
                    <h2 className={styles.cardTitle}>
                      {donation.titulo}
                    </h2>

                    <p className={styles.description}>
                      {donation.detalle}
                    </p>

                    <div className={styles.meta}>
                      <span>
                        {donation.cantidad} | ${donation.cantidad}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/donaciones-catalogo/${donation.id}`}
                    className={styles.button}
                  >
                    Ver más información
                  </Link>
                </article>
              );
            })
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
