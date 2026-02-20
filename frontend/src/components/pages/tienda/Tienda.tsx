'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/Tienda/tienda.module.css';

import { baseApi } from '@/API/baseApi';
import { Beneficio } from '@/API/types/beneficios';

import { isBeneficioVisible } from '@/components/Utils/beneficiosUtils';

import CanjeModal from '@/components/pages/tienda/CanjeModal';

const LIMIT = 10;

export default function Tienda() {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [beneficioSeleccionado, setBeneficioSeleccionado] =
    useState<Beneficio | null>(null);

  /**
   * =========================
   * CARGAR BENEFICIOS
   * =========================
   */
  useEffect(() => {
    const fetchBeneficios = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await baseApi.beneficio.getAllPaginated(page, LIMIT);

        const items = Array.isArray(res.items)
          ? res.items
          : Array.isArray(res)
            ? res
            : [];

        setBeneficios(items);

        setTotalPages(
          Math.ceil((res.total ?? items.length) / LIMIT),
        );
      } catch (err) {
        console.error(err);
        setError('Error al cargar beneficios');
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficios();
  }, [page]);


  return (
    <>
      <main className={styles.container}>
        <h1 className={styles.title}>Tienda</h1>

        {loading && <p>Cargando beneficios...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && (
          <>
            {/* ===== GRID ===== */}
            <section className={styles.grid}>
              {beneficios
                .filter(isBeneficioVisible)
                .map((beneficio) => (
                  <div
                    key={beneficio.id}
                    className={styles.card}
                  >
                    <Image
                      src={
                        beneficio.empresa?.logo ??
                        '/img/placeholder.svg'
                      }
                      alt={
                        beneficio.empresa?.nombre_fantasia ??
                        'Empresa'
                      }
                      width={120}
                      height={120}
                      className={styles.image}
                    />

                    <h3 className={styles.cardTitle}>
                      {beneficio.titulo}
                    </h3>

                    <p className={styles.stock}>
                      Restantes:{' '}
                      <span>{beneficio.cantidad}</span>
                    </p>

                    <button
                      className={styles.button}
                      disabled={
                        beneficio.cantidad === 0
                      }
                      onClick={() =>
                        setBeneficioSeleccionado(
                          beneficio,
                        )
                      }
                    >
                      {beneficio.cantidad === 0
                        ? 'Sin stock'
                        : 'Reclamar'}
                    </button>
                  </div>
                ))}
            </section>

            {/* ===== PAGINACIÓN ===== */}
            <div className={styles.pagination}>
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                Anterior
              </button>

              <span>
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </main>

      {/* ===== MODAL DE CANJE ===== */}
      {beneficioSeleccionado && (
        <CanjeModal
          beneficio={beneficioSeleccionado}
          onClose={() =>
            setBeneficioSeleccionado(null)
          }
        />
      )}
    </>
  );
}
