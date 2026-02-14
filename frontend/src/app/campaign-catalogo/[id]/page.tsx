"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/Donar/donarDetalle.module.css";
import { CampaignDetalle } from "@/API/types/campañas/campaigns";
import { BaseApi } from "@/API/baseApi";

export default function CampaignDetallePage() {
  const params = useParams();
  const router = useRouter();

  const [campaign, setCampaign] = useState<CampaignDetalle | null >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const api = new BaseApi();
        const data = await api.campaign.getOneDetail(
          Number(params.id)
        );

        setCampaign(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchCampaign();
    }
  }, [params]);

  if (loading) {
    return <p className={styles.loading}>Cargando campaña...</p>;
  }

  if (error || !campaign) {
    return (
      <div className={styles.error}>
        <p>Campaña no encontrada</p>
        <button onClick={() => router.push("/campaign-catalogo")}>
          Volver
        </button>
      </div>
    );
  }

  const portada =
    campaign.imagenPortada ||
    campaign.imagenes?.find((img) => img.esPortada)?.url;

  const galeria =
    campaign.imagenes?.filter(
      (img) => img.url !== portada
    ) || [];

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        {portada && (
          <div className={styles.imageWrapper}>
            <Image
              src={portada}
              alt={campaign.titulo}
              fill
              className={styles.image}
            />
          </div>
        )}

        <h1 className={styles.title}>{campaign.titulo}</h1>

        <p className={styles.description}>
          {campaign.descripcion}
        </p>

        <div className={styles.meta}>
          <p><strong>Objetivo:</strong> ${campaign.objetivo}</p>
          <p>
            <strong>Organización:</strong>{" "}
            {campaign.organizacion.nombreFantasia}
          </p>
        </div>

        {galeria.length > 0 && (
          <div className={styles.gallery}>
            {galeria.map((img) => (
              <div key={img.id} className={styles.galleryItem}>
                <Image
                  src={img.url}
                  alt={img.nombre}
                  fill
                  className={styles.galleryImage}
                />
              </div>
            ))}
          </div>
        )}

        <button className={styles.donateButton}>
          Donar ahora
        </button>

        <Link
          href="/campaign-catalogo"
          className={styles.backButton}
        >
          ← Volver al catálogo
        </Link>
      </section>
    </main>
  );
}
