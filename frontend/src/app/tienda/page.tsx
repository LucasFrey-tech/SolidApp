import Image from 'next/image'
import styles from '@/styles/tienda.module.css'

const cupones = [
  {
    id: 1,
    nombre: 'Descuento 20%',
    empresa: 'Nike',
    img: '/empresas/nike.png',
    restantes: 12
  },
  {
    id: 2,
    nombre: '2x1 en comidas',
    empresa: 'McDonalds',
    img: '/empresas/mcdonalds.png',
    restantes: 5
  },
  {
    id: 3,
    nombre: 'Envío gratis',
    empresa: 'Mercado Libre',
    img: '/empresas/mercadolibre.png',
    restantes: 20
  },
  {
    id: 4,
    nombre: '50% en accesorios',
    empresa: 'Mercado Libre',
    img: '/empresas/mercadolibre.png',
    restantes: 20
  }
]

export default function TiendaPage() {
  return (
    <main className={styles.container}>
      {/* Título */}
      <h1 className={styles.title}>Tienda</h1>

      {/* Grid de cupones */}
      <section className={styles.grid}>
        {cupones.map((cupon) => (
          <div key={cupon.id} className={styles.card}>
            <Image
              src={cupon.img}
              alt={cupon.empresa}
              width={120}
              height={120}
              className={styles.image}
            />

            <h3 className={styles.cardTitle}>{cupon.nombre}</h3>

            <p className={styles.stock}>
              Restantes: <span>{cupon.restantes}</span>
            </p>

            <button className={styles.button}>
              Reclamar
            </button>
          </div>
        ))}
      </section>
    </main>
  )
}
