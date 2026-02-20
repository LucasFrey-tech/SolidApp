'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/Tienda/beneficios.module.css';

import { BeneficiosService } from '@/API/class/beneficios';
import { Beneficio } from '@/API/types/beneficios';

import CanjeModal from '@/components/pages/tienda/CanjeModal';

/* ==================== HELPERS ==================== */
import { isBeneficioVisible } from '../../Utils/beneficiosUtils';

/* ==================== PROPS ==================== */
interface Props {
  idEmpresa?: number;
  modo?: 'empresa' | 'general';
  onClose: () => void;
}

/* ==================== COMPONENT ==================== */
export default function BeneficiosPanel({
  idEmpresa,
  modo = 'empresa',
  onClose,
}: Props) {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [beneficioSeleccionado, setBeneficioSeleccionado] =
    useState<Beneficio | null>(null);

  /* ==================== FETCH ==================== */
  useEffect(() => {
    const fetchBeneficios = async () => {
      try {
        setLoading(true);
        const service = new BeneficiosService();

        const data =
          modo === 'general'
            ? await service.getGenerales()
            : await service.getByEmpresa(idEmpresa!);

        setBeneficios(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error cargando beneficios', error);
        setBeneficios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficios();
  }, [idEmpresa, modo]);

  /* ==================== BENEFICIOS VISIBLES ==================== */
  const beneficiosVisibles = beneficios.filter(isBeneficioVisible);

  /* ==================== RENDER ==================== */
  return (
    <>
      <div className={styles.overlay}>
        <aside className={styles.panel}>
          {/* HEADER */}
          <header className={styles.header}>
            <button onClick={onClose} className={styles.backBtn}>
              Volver
            </button>

            <h2 className={styles.titleBeneficios}>
              {modo === 'general'
                ? 'Beneficios generales'
                : 'Beneficios'}
            </h2>
          </header>

          {/* ESTADOS */}
          {loading && <p>Cargando beneficios...</p>}

          {!loading && beneficiosVisibles.length === 0 && (
            <p className={styles.emptyState}>No hay beneficios disponibles, vuelve mas tarde!</p>
          )}

          {/* LISTA */}
          {!loading && beneficiosVisibles.length > 0 && (
            <div className={styles.list}>
              {beneficiosVisibles.map((beneficio) => (
                <div key={beneficio.id} className={styles.card}>
                  <div className={styles.logo}>
                    {beneficio.empresa.nombre_fantasia}
                  </div>

                  <div className={styles.mainInfo}>
                    <div className={styles.discount}>
                      {beneficio.titulo}
                    </div>
                    <div className={styles.subtitle}>
                      {beneficio.tipo}
                    </div>
                  </div>

                  <div className={styles.detail}>
                    {beneficio.detalle}
                  </div>

                  <div className={styles.valor}>
                    <span>Puntos</span>
                    <strong>{beneficio.valor}</strong>
                  </div>

                  <div className={styles.action}>
                    <button
                      className={styles.canjearBtn}
                      disabled={beneficio.cantidad === 0}
                      onClick={() =>
                        setBeneficioSeleccionado(beneficio)
                      }
                    >
                      {beneficio.cantidad === 0
                        ? 'Sin stock'
                        : 'Canjear'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* MODAL */}
      {beneficioSeleccionado && (
        <CanjeModal
          beneficio={beneficioSeleccionado}
          onClose={() => setBeneficioSeleccionado(null)}
        />
      )}
    </>
  );
}
