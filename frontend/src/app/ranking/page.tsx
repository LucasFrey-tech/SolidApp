'use client';

import { useEffect, useState } from 'react';
import { BaseApi } from '@/API/baseApi';
import type { RankingItem } from '@/API/types/ranking';

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = new BaseApi();
    api.ranking
      .getTop10()
      .then(setRanking)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando ranking...</p>;

  return (
    <ul>
      {ranking.map((item, i) => (
        <li key={item.id_usuario}>
          #{i + 1} - Usuario {item.id_usuario} - {item.puntos} pts
        </li>
      ))}
    </ul>
  );
}
