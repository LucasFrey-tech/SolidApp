'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/empresaTienda.module.css';

import { Empresa, EmpresaImagen } from '@/API/types/empresas';
import { BaseApi } from '@/API/baseApi';
import BeneficiosPanel from '@/components/pages/Beneficios';

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
  const api = new BaseApi();

  // Empresas paginadas
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  // Imágenes de empresas
  const [empresasImagen, setEmpresasImagen] = useState<EmpresaImagen[]>([]);

  const [empresaActiva, setEmpresaActiva] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== FETCH ====================
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        setLoading(true);

        const [empresasRes, imagenesRes] = await Promise.all([
          api.empresa.getAllPaginated(1, 20),
          api.empresa.getImages(),
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
        setEmpresasImagen(imagenesRes);
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
              const imagen = empresasImagen.find(
                (img) => img.empresaId === empresa.id
              );

              return (
                <button
                  key={empresa.id}
                  className={styles.card}
                  onClick={() => setEmpresaActiva(empresa.id)}
                  aria-label={empresa.nombre_fantasia}
                >
                  <EmpresaLogo
                    src={imagen?.logo}
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
