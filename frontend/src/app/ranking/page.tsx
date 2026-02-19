'use client';

import { useEffect, useState } from 'react';
import type { RankingItem } from '@/API/types/ranking';
import styles from '@/styles/Ranking/ranking.module.css'
import { baseApi } from '@/API/baseApi';

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      const res = await baseApi.ranking.getTop10();
      setRanking(res);
      setLoading(false);
      console.log(res);
    }
    fetchRanking();
  }, []);

  if (loading) return <p>Cargando ranking...</p>;

  return (
    <div className={styles.container}>
      <ul>
        {ranking.map((item, i) => (
          <li key={item.id_usuario}  className={styles.list_item}>
            #{i + 1} - {item.nombre} {item.apellido} - {item.puntos} pts
          </li>
        ))}
      </ul>
    </div>
  );
}
