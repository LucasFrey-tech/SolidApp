'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/beneficios.module.css';

import { BeneficiosService } from '@/API/class/beneficios';
import { Beneficio } from '@/API/types/beneficios';

import CanjeModal from '@/components/pages/CanjeModal';

interface Props {
  idEmpresa: number;
  onClose: () => void;
}

export default function BeneficiosPanel({ idEmpresa, onClose }: Props) {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [beneficioSeleccionado, setBeneficioSeleccionado] =
    useState<Beneficio | null>(null);

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

  return (
    <>
      <div className={styles.overlay}>
        <aside className={styles.panel}>
          {/* HEADER */}
          <header className={styles.header}>
            <button onClick={onClose} className={styles.backBtn}>
              Volver
            </button>
            <h2 className={styles.titleBeneficios}>Beneficios</h2>
          </header>

          {loading && <p>Cargando beneficios...</p>}

          {!loading && beneficios.length === 0 && (
            <p>Esta empresa no tiene beneficios</p>
          )}

          {/* LISTA */}
          <div className={styles.list}>
            {beneficios.map((beneficio: Beneficio) => (
              <div key={beneficio.id} className={styles.card}>
                <div className={styles.logo}>
                  {beneficio.empresa.nombre_fantasia}
                </div>

                <div className={styles.mainInfo}>
                  <div className={styles.discount}>{beneficio.titulo}</div>
                  <div className={styles.subtitle}>{beneficio.tipo}</div>
                </div>

                <div className={styles.detail}>{beneficio.detalle}</div>

                {/* PUNTOS (ESTÁTICOS) */}
                <div className={styles.valor}>
                  <span>Puntos</span>
                  <strong>{beneficio.valor}</strong>
                </div>

                {/* ACCIÓN */}
                <div className={styles.action}>
                  <button
                    className={styles.canjearBtn}
                    onClick={() => setBeneficioSeleccionado(beneficio)}
                  >
                    Canjear
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* MODAL DE CANJE */}
      {beneficioSeleccionado && (
        <CanjeModal
          beneficio={beneficioSeleccionado}
          onClose={() => setBeneficioSeleccionado(null)}
        />
      )}
    </>
  );
}
