"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/Donar/donarDetalle.module.css";
import { CampaignDetalle } from "@/API/types/campañas/campaigns";
import { baseApi } from "@/API/baseApi";
import DonarModal from "@/components/pages/donaciones/DonarModal";
import { useUser } from "@/app/context/UserContext";
import { RolCuenta } from "@/API/types/auth";

export default function CampaignDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [campaign, setCampaign] = useState<CampaignDetalle | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await baseApi.campaign.getOneDetail(Number(params.id));

        setCampaign(data);

        const portadaDefault =
          data.imagenPortada ||
          data.imagenes?.find((img) => img.esPortada)?.url ||
          null;

        setSelectedImage(portadaDefault);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchCampaign();
    }
  }, [params]);

  const galeriaCompleta = useMemo(() => {
    if (!campaign) return [];

    const imagenesValidas =
      campaign.imagenes?.filter((img) => img.url && img.url.trim() !== "") ||
      [];

    if (campaign.imagenPortada) {
      const existePortada = imagenesValidas.some(
        (img) => img.url === campaign.imagenPortada,
      );

      if (!existePortada) {
        imagenesValidas.unshift({
          id: -1,
          url: campaign.imagenPortada,
          nombre: "portada",
          esPortada: true,
        });
      }
    }

    return imagenesValidas;
  }, [campaign]);

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

  return (
    <>
      <main className={styles.page}>
        <section className={styles.container}>
          {selectedImage && (
            <div
              className={styles.imageWrapper}
              onClick={() => setIsLightboxOpen(true)}
            >
              <Image
                src={selectedImage}
                alt={campaign.titulo}
                width={900}
                height={600}
                className={styles.image}
                priority
              />
            </div>
          )}

          <h1 className={styles.title}>{campaign.titulo}</h1>
          <p className={styles.description}>{campaign.descripcion}</p>

          <div className={styles.meta}>
            <p>
              <strong>Objetivo:</strong> {campaign.objetivo}
            </p>
            <p>
              <strong>Organización:</strong>{" "}
              {campaign.organizacion.nombre_organizacion}
            </p>
          </div>

          {galeriaCompleta.length > 0 && (
            <div className={styles.gallery}>
              {galeriaCompleta.map((img) => (
                <div
                  key={img.id}
                  className={`${styles.galleryItem} ${
                    selectedImage === img.url ? styles.activeThumb : ""
                  }`}
                  onClick={() => setSelectedImage(img.url)}
                >
                  <Image
                    src={img.url}
                    alt={img.nombre}
                    width={200}
                    height={200}
                    className={styles.galleryImage}
                  />
                </div>
              ))}
            </div>
          )}

          {user?.role === RolCuenta.USUARIO ? (
            <button
              className={styles.donateButton}
              onClick={() => setIsModalOpen(true)}
            >
              Donar ahora
            </button>
          ) : (
            <div className={styles.noDonation}>
              <p>Solo los usuarios pueden realizar donaciones</p>
              <Link href="/campaign-catalogo" className={styles.backButton}>
                ← Volver al catálogo
              </Link>
            </div>
          )}
        </section>
      </main>

      {isLightboxOpen && selectedImage && (
        <div
          className={styles.lightbox}
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Imagen ampliada"
              width={1600}
              height={1200}
              className={styles.lightboxImage}
              priority
            />
          </div>
        </div>
      )}

      {user && (
        <DonarModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          campaignId={campaign.id}
          campaignTitle={campaign.titulo}
          puntosPorArticulo={campaign.puntos}
          objetivoRestante={campaign.objetivo}
        />
      )}
    </>
  );
}