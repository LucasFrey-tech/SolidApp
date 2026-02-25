'use client';

import { useEffect, useState } from 'react';
import type { RankingItem } from '@/API/types/ranking';
import styles from '@/styles/Ranking/ranking.module.css';
import { baseApi } from '@/API/baseApi';

export default function RankingPage() {

  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const res = await baseApi.ranking.getTop10();
        console.log(res);
        setRanking(res);
      } catch (error) {
        console.error("Error en el fetch de ranking", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.loading}>Cargando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      <div className={styles.card}>

        <h2 className={styles.title}>🏆 Ranking de usuarios</h2>

        <ul className={styles.list}>

          {ranking.map((item, index) => {

            let positionClass = '';

            if (index === 0) positionClass = styles.first;
            else if (index === 1) positionClass = styles.second;
            else if (index === 2) positionClass = styles.third;

            return (
              <li
                key={item.id_usuario}
                className={`${styles.list_item} ${positionClass}`}
              >

                <div className={styles.left}>

                  <span className={styles.position}>
                    #{index + 1}
                  </span>

                  <span className={styles.name}>
                    {item.nombre} {item.apellido}
                  </span>

                </div>

                <span className={styles.points}>
                  {item.puntos} pts
                </span>

              </li>
            );
          })}

        </ul>

      </div>

    </div>
  );
}