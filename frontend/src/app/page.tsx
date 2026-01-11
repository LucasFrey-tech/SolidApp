'use client'

import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';


export default function Home() {
  return (
    <div className={styles.container}>
    <section className={styles.banner}>
    <Image
      src="/banners/banner-inicio.png"
      alt="Banner"
      fill
      className={styles.image}
    />
   <div className={styles.overlay}>
    <h2 className={styles.titleBanner}>Un pequeño gesto, un gran impacto.</h2>
  </div>
</section>


    <div className={styles.pasosDonar}>
    <div className={styles.iconosDonar}>
      <Image
        src="/fotosInicio/donar.png"
        alt="Icono 1"
        width={80}
        height={80}
      />
      <h3 className={styles.tituloIcono}>Doná</h3>
      <p className={styles.textoIcono}>Seleccioná entre ropa, alimentos o juguetes.</p>
    </div>
    <div className={styles.iconosDonar}>
      <Image
        src="/fotosInicio/puntos.png"
        alt="Icono 1"
        width={80}
        height={80}
      />
      <h3 className={styles.tituloIcono}>Obten puntos</h3>
      <p className={styles.textoIcono}>Obtene puntos por donar artículos</p>
    </div>
    <div className={styles.iconosDonar}>
      <Image
        src="/fotosInicio/canjeo.png"
        alt="Icono 1"
        width={80}
        height={80}
      />
      <h3 className={styles.tituloIcono}> Canjea por premios</h3>
      <p className={styles.textoIcono}>Reclamá premios con tus puntos</p>
    </div>




    </div>

    </div>
  );
}
