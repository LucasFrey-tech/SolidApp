import { FaMedal } from 'react-icons/fa'; 
import Link from 'next/link';
import styles from '@/styles/Inicio/RankingCard.module.css'

export default function RankingCard() {
  return (
    <Link href="/ranking" className={styles.linkCard}>
        
      <div className={styles.iconosDonar}>
        <FaMedal size={50} color="#FFD700" />
        <h3 className={styles.tituloIcono}>Top Donadores</h3>
        <p className={styles.textoIcono}>
          Conocé a los usuarios con más puntos y su impacto en la comunidad.
        </p>
      </div>
    </Link>
  )
}

