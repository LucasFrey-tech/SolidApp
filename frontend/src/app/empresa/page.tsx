'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "@/styles/empresa.module.css";

import { EmpresasService } from "@/API/class/empresas";
import { Empresa } from "@/API/types/empresas";


export default function EmpresaPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const service = new EmpresasService();
        const data = await service.getAll();
        setEmpresas(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las empresas');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, []);

  if (loading) {
    return <p className={styles.loading}>Cargando empresas...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <section className={styles.container}>
      <div className={styles.grid}>
        {empresas.map((empresa) => (
          <button
            key={empresa.id}
            className={styles.card}
            aria-label={empresa.razon_social}
          >
            <Image
              src="/sampleText.png" // placeholder
              alt={empresa.razon_social}
              width={120}
              height={50}
              className={styles.image}
            />
          </button>
        ))}
      </div>
    </section>
  );
}