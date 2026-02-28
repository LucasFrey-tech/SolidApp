"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "@/styles/Tienda/tienda.module.css";

import { baseApi } from "@/API/baseApi";
import { Beneficio } from "@/API/types/beneficios";

import { isBeneficioVisible } from "@/components/Utils/beneficiosUtils";

import CanjeModal from "@/components/pages/tienda/CanjeModal";
import { useUser } from "@/app/context/UserContext";
import { RolCuenta } from "@/API/types/auth";

const LIMIT = 10;
const PLACEHOLDER_IMG = "/img/placeholder.svg";

export default function Tienda() {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [beneficioSeleccionado, setBeneficioSeleccionado] = useState<Beneficio | null>(null);
  const { user } = useUser();

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

        const res = await baseApi.beneficio.getAllPaginated(
          page,
          LIMIT,
          undefined,
          true,
        );
        console.log(res.items);

        const items = Array.isArray(res.items)
          ? res.items
          : Array.isArray(res)
            ? res
            : [];

        setBeneficios(items);
        setTotalPages(Math.max(1, Math.ceil(res.total / LIMIT)));
      } catch (err) {
        console.error(err);
        setError("Error al cargar beneficios");
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficios();
  }, [page]);

  /**
   * Obtiene la URL de la imagen considerando errores
   */
  function EmpresaLogo({ src, alt }: { src?: string | null; alt: string }) {
    const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER_IMG);

    console.log("ALTERNATIVE TEXT: ", alt);

    return (
      <Image
        src={imgSrc}
        alt={alt}
        width={120}
        height={50}
        className={styles.image}
        onError={() => setImgSrc(PLACEHOLDER_IMG)}
      />
    );
  }

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
              {beneficios.filter(isBeneficioVisible).map((beneficio) => (
                <div key={beneficio.id} className={styles.card}>
                  <EmpresaLogo
                    src={beneficio.empresa.logo}
                    alt={beneficio.empresa.nombre_empresa}
                  />

                  <h3 className={styles.cardTitle}>{beneficio.titulo}</h3>

                  <p className={styles.stock}>
                    Restantes: <span>{beneficio.cantidad}</span>
                  </p>

                  {user?.role === RolCuenta.USUARIO && (
                    <button
                      className={styles.button}
                      disabled={beneficio.cantidad === 0}
                      onClick={() => setBeneficioSeleccionado(beneficio)}
                    >
                      {beneficio.cantidad === 0 ? "Sin stock" : "Reclamar"}
                    </button>
                  )}
                </div>
              ))}
            </section>

            {/* ===== PAGINACIÓN ===== */}
            <div className={styles.pagination}>
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === totalPages || beneficios.length === 0}
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
          onClose={() => setBeneficioSeleccionado(null)}
        />
      )}
    </>
  );
}
