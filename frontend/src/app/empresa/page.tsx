'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from '@/styles/empresa.module.css';

import { EmpresasService } from '@/API/class/empresas';
import { Empresa } from '@/API/types/empresas';
import BeneficiosPanel from "@/components/pages/Beneficios";


export default function EmpresaPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresa');

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const service = new EmpresasService();
        const data = await service.getAll();
        setEmpresas(data);
      } catch {
        setError('No se pudieron cargar las empresas');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, []);

  const handleEmpresaClick = (id: number) => {
    router.push(`/empresa?empresa=${id}`);
  };

  if (loading) return <p>Cargando empresas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      {/* LISTA DE EMPRESAS */}
      <section className={styles.container}>
        <div className={styles.grid}>
          {empresas.map((empresa) => (
            <button
              key={empresa.id}
              className={styles.card}
              onClick={() => handleEmpresaClick(empresa.id)}
              aria-label={empresa.razon_social}
            >
              <Image
                src="/sampleText.png"
                alt={empresa.razon_social}
                width={120}
                height={50}
                className={styles.image}
              />
            </button>
          ))}
        </div>
      </section>

      {/* PANEL OVERLAY */}
      {empresaId && (
        <BeneficiosPanel idEmpresa={Number(empresaId)} />
      )}
    </>
  );
}
