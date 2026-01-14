'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/beneficios.module.css';
import { BeneficiosService } from '@/API/class/beneficios';
import { Beneficio } from '@/API/types/beneficios';

interface Props {
  idEmpresa: number;
}

export default function BeneficiosPanel({ idEmpresa }: Props) {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBeneficios = async () => {
      try {
        const service = new BeneficiosService();
        const data = await service.getByEmpresa(idEmpresa);
        setBeneficios(data);
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficios();
  }, [idEmpresa]);

  const handleClose = () => {
    router.push('/empresa');
  };

  return (
    <div className={styles.overlay}>
      <aside className={styles.panel}>
        <header className={styles.header}>
          <h2>Beneficios</h2>
          <button onClick={handleClose} className={styles.backBtn}>
            Volver
          </button>
        </header>

        {loading && <p>Cargando beneficios...</p>}

        {!loading && beneficios.length === 0 && (
          <p>Esta empresa no tiene beneficios</p>
        )}

        <div className={styles.list}>
          {beneficios.map((beneficio) => (
            <div key={beneficio.id} className={styles.card}>

              {/* LOGO */}
              <div className={styles.logo}>
                {beneficio.empresa.nombre_fantasia} {/* cambiar por imagen empresa */}
              </div>

              <div className={styles.mainInfo}>
                {/* TITULO */}
                <div className={styles.discount}>
                  {beneficio.titulo}
                </div>
                {/* TIPO */}
                <div className={styles.subtitle}>
                  {beneficio.tipo}
                </div>
              </div>

              {/* DETALLE */}
              <div className={styles.detail}>
                {beneficio.detalle}
              </div>

              {/* VALOR */}
              <div className={styles.valor}>
                {beneficio.valor} pts
              </div>

              {/* ACCIÓN */}
              <div className={styles.action}>
                <span className={styles.plus}>+</span>
                <span className={styles.more}>Canjear</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
