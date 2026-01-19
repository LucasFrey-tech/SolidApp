'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/empresa.module.css';

import { Empresa, EmpresaImagen } from '@/API/types/empresas';
import { BaseApi } from '@/API/baseApi';
import BeneficiosPanel from '@/components/pages/Beneficios';

export default function Empresas() {
  const api = new BaseApi();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [logos, setLogos] = useState<Record<number, string>>({});
  const [empresaActiva, setEmpresaActiva] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar empresas
   */
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const data = await api.empresa.getAll();
        setEmpresas(data);
      } catch {
        setError('No se pudieron cargar las empresas');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, []);

  /**
   * Cargar imágenes
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
        console.error('Error cargando imágenes', err);
      }
    };

    fetchLogos();
  }, []);

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
              onClick={() => setEmpresaActiva(empresa.id)}
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
