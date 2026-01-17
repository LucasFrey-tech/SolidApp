'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from '@/styles/inicio.module.css'

export default function Home() {
  return (
    <div className={styles.container}>

      {/* ========== BANNER ========== */}
      <section className={styles.banner}>
        <Image
          src="/banners/banner-inicio.png"
          alt="Banner"
          fill
          className={styles.image}
          priority
        />
        <div className={styles.overlay}>
          <h2 className={styles.titleBanner}>
            Un pequeño gesto, un gran impacto.
          </h2>
        </div>
      </section>

      {/* ========== PASOS PARA DONAR ========== */}
      <section className={styles.pasosDonar}>

        <Link href="/donaciones-catalogo" className={styles.linkCard}>
          <div className={styles.iconosDonar}>
            <Image
              src="/fotosInicio/donar.png"
              alt="Icono donar"
              width={80}
              height={80}
              className={styles.iconoImagen}
            />
            <h3 className={styles.tituloIcono}>Doná</h3>
            <p className={styles.textoIcono}>
              Seleccioná entre ropa, alimentos o juguetes.
            </p>
          </div>
        </Link>

        <Link href="/como-participar" className={styles.linkCard}>
          <div className={styles.iconosDonar}>
            <Image
              src="/fotosInicio/puntos.png"
              alt="Icono puntos"
              width={80}
              height={80}
              className={styles.iconoImagen}
            />
            <h3 className={styles.tituloIcono}>Obtené puntos</h3>
            <p className={styles.textoIcono}>
              Obtené puntos por donar artículos.
            </p>
          </div>
        </Link>

        <Link href="/tienda" className={styles.linkCard}>
          <div className={styles.iconosDonar}>
            <Image
              src="/fotosInicio/canjeo.png"
              alt="Icono canje"
              width={80}
              height={80}
              className={styles.iconoImagen}
            />
            <h3 className={styles.tituloIcono}>Canjeá por premios</h3>
            <p className={styles.textoIcono}>
              Reclamá premios con tus puntos.
            </p>
          </div>
        </Link>

      </section>

    </div>
  )
}
