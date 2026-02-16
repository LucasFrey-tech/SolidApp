"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { CampaignCreateRequest } from "@/API/types/campañas/campaigns";
import { CampaignEstado } from "@/API/types/campañas/enum";
import styles from "@/styles/Paneles/campaignPanel.module.css";

export type CampaignFormValues = Omit<
  CampaignCreateRequest,
  "id_organizacion"
> & {
  imagenes?: File[];
};

type Props = {
  initialValues?: Partial<CampaignFormValues>;
  onSubmit: (data: CampaignFormValues) => void;
  onCancel: () => void;
};

export function CampaignForm({ initialValues, onSubmit, onCancel }: Props) {
  const isEditMode = !!initialValues;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CampaignFormValues>({
    defaultValues: initialValues ?? {
      titulo: "",
      descripcion: "",
      objetivo: 1,
      fecha_Inicio: "",
      fecha_Fin: "",
      imagenes: [],
      estado: CampaignEstado.PENDIENTE,
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // 🔥 Agregar archivos
  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files);

    const updatedFiles = [...selectedFiles, ...newFiles];

    setSelectedFiles(updatedFiles);
    setValue("imagenes", updatedFiles);

    const updatedPreviews = updatedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(updatedPreviews);
  };

  // 🔥 Eliminar imagen por índice
  const removeImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);

    // liberar memoria de la imagen eliminada
    URL.revokeObjectURL(previews[index]);

    setSelectedFiles(updatedFiles);
    setValue("imagenes", updatedFiles);

    const updatedPreviews = updatedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(updatedPreviews);
  };

  // 🔥 Limpiar todas las URLs al desmontar
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const submit = (data: CampaignFormValues) => {
    onSubmit(data);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)}>
      <h3 className={styles.title}>
        {isEditMode ? "Editar Campaña" : "Nueva Campaña"}
      </h3>

      {/* TÍTULO */}
      <div className={styles.field}>
        <label>Título</label>
        <input {...register("titulo", { required: "Obligatorio" })} />
        {errors.titulo && (
          <span className={styles.error}>{errors.titulo.message}</span>
        )}
      </div>

      {/* DESCRIPCIÓN */}
      <div className={styles.field}>
        <label>Descripción</label>
        <textarea
          rows={3}
          {...register("descripcion", { required: "Obligatorio" })}
        />
        {errors.descripcion && (
          <span className={styles.error}>{errors.descripcion.message}</span>
        )}
      </div>

      {/* FECHA INICIO */}
      <div className={styles.field}>
        <label>Fecha Inicio</label>
        <input
          type="date"
          {...register("fecha_Inicio", { required: "Obligatorio" })}
        />
      </div>

      {/* FECHA FIN */}
      <div className={styles.field}>
        <label>Fecha Fin</label>
        <input
          type="date"
          {...register("fecha_Fin", { required: "Obligatorio" })}
        />
      </div>

      {/* OBJETIVO */}
      <div className={styles.field}>
        <label>Objetivo</label>
        <input
          type="number"
          {...register("objetivo", {
            required: "Obligatorio",
            valueAsNumber: true,
            min: { value: 1, message: "Debe ser mayor a 0" },
          })}
        />
        {errors.objetivo && (
          <span className={styles.error}>{errors.objetivo.message}</span>
        )}
      </div>

      {/* ESTADO */}
      {isEditMode && (
        <div className={styles.field}>
          <label>Estado</label>
          <select
            className={styles.select}
            {...register("estado", { required: "Obligatorio" })}
          >
            {Object.values(CampaignEstado).map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* IMÁGENES */}
      <div className={styles.field}>
        <label>Imágenes</label>

        <div
          className={styles.dropZone}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) {
              handleFiles(e.dataTransfer.files);
            }
          }}
        >
          {previews.length > 0 ? (
            <div className={styles.previewContainer}>
              {previews.map((src, index) => (
                <div key={index} className={styles.previewWrapper}>
                  <img
                    src={src}
                    className={styles.previewImage}
                  />
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>Arrastrá imágenes acá</p>
          )}
        </div>

        <button
          type="button"
          className={styles.exploreButton}
          onClick={() => fileInputRef.current?.click()}
        >
          Explorar archivos
        </button>

        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(e.target.files);
            }
          }}
        />
      </div>

      {/* BOTONES */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.dangerButton}
        >
          Cancelar
        </button>

        <button type="submit" className={styles.primaryButton}>
          {isEditMode ? "Guardar" : "Crear"}
        </button>
      </div>
    </form>
  );
}
