"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BaseApi } from "@/API/baseApi";
import type { Donation, DonacionImagen } from "@/API/types/donaciones";
import styles from "@/styles/donar.module.css";

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

  if (loading) {
    return <p className={styles.loading}>Cargando campañas...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
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
          {donations.map((donation) => {
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
                  <h2 className={styles.cardTitle}>{donation.titulo}</h2>

                  <p className={styles.description}>
                    {donation.detalle}
                  </p>

                  <div className={styles.meta}>
                    <span>
                      {donation.cantidad} | ${donation.cantidad}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              ←
            </button>

            <span>
              Página {currentPage} de {totalPages}
            </span>

            <button
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
