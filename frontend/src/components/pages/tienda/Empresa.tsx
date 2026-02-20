'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/Tienda/empresaTienda.module.css';

import { Empresa} from '@/API/types/empresas';
import { baseApi } from '@/API/baseApi';
import BeneficiosPanel from '@/components/pages/tienda/Beneficios';

// ==================== CONSTANTES ====================
const PLACEHOLDER_IMG = '/img/placeholder.svg';

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
  // Empresas paginadas
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const [empresaActiva, setEmpresaActiva] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== FETCH ====================
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        setLoading(true);

        const [empresasRes] = await Promise.all([
          baseApi.empresa.getAllPaginated(1, 20),
        ]);

        // 🛡️ Normalización defensiva
        const empresasData = Array.isArray(empresasRes)
          ? empresasRes
          : Array.isArray((empresasRes as any)?.data)
            ? (empresasRes as any).data
            : Array.isArray((empresasRes as any)?.items)
              ? (empresasRes as any).items
              : [];

        setEmpresas(empresasData);
      } catch (err) {
        console.error('Error cargando empresas', err);
        setError('Error al cargar empresas');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, []);


  // ==================== ESTADOS ====================
  if (loading) return <p>Cargando empresas...</p>;
  if (error) return <p>{error}</p>;

  // ==================== RENDER ====================
  return (
    <>
      {/* LISTA DE EMPRESAS */}
      <section className={styles.container}>
        <h2 className={styles.title}>Empresas</h2>

        <div className={styles.grid}>
          {empresas
            .filter((empresa) => !empresa.deshabilitado)
            .map((empresa) => {

              return (
                <button
                  key={empresa.id}
                  className={styles.card}
                  onClick={() => setEmpresaActiva(empresa.id)}
                  aria-label={empresa.nombre_fantasia}
                >
                  <EmpresaLogo
                    src={empresa.logo}
                    alt={empresa.nombre_fantasia}
                  />
                </button>
              );
            })}

        </div>
      </section>

      {/* PANEL DE BENEFICIOS */}
      {empresaActiva !== null && (
        <BeneficiosPanel
          idEmpresa={empresaActiva}
          onClose={() => setEmpresaActiva(null)}
        />
      )}
    </>
  );
}
