'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/Tienda/empresaTienda.module.css';

import { Empresa } from '@/API/types/empresas';
import { baseApi } from '@/API/baseApi';
import BeneficiosPanel from '@/components/pages/tienda/Beneficios';

// ==================== CONSTANTES ====================
const PLACEHOLDER_IMG = '/img/placeholder.svg';
const LIMIT = 12;

// ==================== COMPONENTE LOGO ====================
function EmpresaLogo({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER_IMG);

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

// ==================== PAGE ====================
export default function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const [empresaActiva, setEmpresaActiva] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== FETCH ====================
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await baseApi.empresa.getAllPaginated(page, LIMIT, undefined, true);

        const items = Array.isArray(res.items)
          ? res.items
          : Array.isArray(res)
          ? res
          : [];

        setEmpresas(items);

        setTotalPages(
          Math.ceil((res.total ?? items.length) / LIMIT),
        );
      } catch (err) {
        console.error(err);
        setError('Error al cargar empresas');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, [page]);

  // ==================== ESTADOS ====================
  if (loading) return <p className={styles.loading}>Cargando empresas...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  // ==================== RENDER ====================
  return (
    <>
      <section className={styles.container}>
        <h2 className={styles.title}>Empresas</h2>

        {/* ===== GRID ===== */}
        <div className={styles.grid}>
          {empresas
            .filter((empresa) => !empresa.deshabilitado)
            .map((empresa) => (
              <button
                key={empresa.id}
                className={styles.card}
                onClick={() => setEmpresaActiva(empresa.id)}
                aria-label={empresa.nombre_empresa}
              >
                <EmpresaLogo
                  src={empresa.logo}
                  alt={empresa.nombre_empresa}
                />
              </button>
            ))}
        </div>

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
      </section>

      {/* ===== PANEL BENEFICIOS ===== */}
      {empresaActiva !== null && (
        <BeneficiosPanel
          idEmpresa={empresaActiva}
          onClose={() => setEmpresaActiva(null)}
        />
      )}
    </>
  );
}