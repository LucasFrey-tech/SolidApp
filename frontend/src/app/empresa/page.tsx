'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from '@/styles/empresa.module.css';

import { Empresa, EmpresaImagen } from '@/API/types/empresas';
import { BaseApi } from '@/API/baseApi';
import BeneficiosPanel from '@/components/pages/Beneficios';

export default function EmpresaPage() {
  const api = new BaseApi();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [logos, setLogos] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresa');

  /**
   * Cargar empresas
   */
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const data = await api.empresa.getAll();
        setEmpresas(data);
      } catch (err) {
        setError('No se pudieron cargar las empresas');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, []);

  /**
   * Cargar imágenes usando BaseApi
   */
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const images: EmpresaImagen[] = await api.empresa.getImages();

        const map = Object.fromEntries(
          images.map((img) => [img.empresaId, img.logo]),
        );

        setLogos(map);
      } catch (err) {
        console.error('Error cargando imágenes de empresas', err);
      }
    };

    fetchLogos();
  }, []);

  const handleEmpresaClick = (id: number) => {
    router.push(`/empresa?empresa=${id}`, { scroll: false });
  };

  const handleClosePanel = () => {
    router.push('/empresa', { scroll: false });
  };

  if (loading) return <p>Cargando empresas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      {/* LISTA DE EMPRESAS */}
      <section className={styles.container}>
        <h2 className={styles.title}>Empresas</h2>

        <div className={styles.grid}>
          {empresas.map((empresa) => (
            <button
              key={empresa.id}
              className={styles.card}
              onClick={() => handleEmpresaClick(empresa.id)}
              aria-label={empresa.razon_social}
            >
              <Image
                src={logos[empresa.id] ?? '/logos/default.svg'}
                alt={empresa.razon_social}
                width={120}
                height={50}
                className={styles.image}
              />
            </button>
          ))}
        </div>
      </section>

      {/* PANEL DE BENEFICIOS (OVERLAY) */}
      {empresaId && (
        <BeneficiosPanel
          idEmpresa={Number(empresaId)}
          onClose={handleClosePanel}
        />
      )}
    </>
  );
}
