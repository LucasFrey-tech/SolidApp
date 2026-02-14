"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { CampaignCreateRequest } from "@/API/types/campañas/campaigns";
import { CampaignEstado } from "@/API/types/campañas/enum";
import styles from "@/styles/Paneles/campaignPanel.module.css";

type CampaignFormValues = Omit<
  CampaignCreateRequest,
  "id_organizacion"
> & {
  imagen?: File; 
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
      imagen: undefined,
      estado: CampaignEstado.PENDIENTE,
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setValue("imagen", file as any);
    setPreview(URL.createObjectURL(file));
  };

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

      {/* ESTADO (solo en edición) */}
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

      {/* IMAGEN */}
      <div className={styles.field}>
        <label>Imagen</label>

        <div
          className={styles.dropZone}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
        >
          {preview ? (
            <img src={preview} className={styles.previewImage} />
          ) : (
            <p>Arrastrá una imagen acá</p>
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
          hidden
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
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
