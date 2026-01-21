'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/empresaTienda.module.css';

import { Empresa, EmpresaImagen } from '@/API/types/empresas';
import { BaseApi } from '@/API/baseApi';
import BeneficiosPanel from '@/components/pages/Beneficios';
import { Images } from 'lucide-react';

export default function Empresas() {
  const api = new BaseApi();

  const [empresasImagen, setEmpresasImagen] = useState<EmpresaImagen[]>([]);
  const [empresaActiva, setEmpresaActiva] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar empresas
   */
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const images: EmpresaImagen[] = await api.empresa.getImages();
        setEmpresasImagen(images);
      } catch (err) {
        console.error('Error cargando imágenes', err);
      }
    };
    fetchLogos();
    setLoading(false);
  }, []);

  if (loading) return <p>Cargando empresas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      {/* LISTA DE EMPRESAS */}
      <section className={styles.container}>
        <h2 className={styles.title}>Empresas</h2>

        <div className={styles.grid}>
          {empresasImagen.map((empresa) => (
            <button
              key={empresa.empresaId}
              className={styles.card}
              onClick={() => setEmpresaActiva(empresa.empresaId)}
              aria-label={empresa.nombre}
            >
              <Image
                src={empresa.logo ?? 'http://localhost:3001/resources/404.png'}
                alt={empresa.nombre}
                width={120}
                height={50}
                className={styles.image}
              />
            </button>
          ))}
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
