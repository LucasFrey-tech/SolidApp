"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CampaignEstado } from "@/API/types/campañas/enum";
import styles from "@/styles/campaignPanel.module.css";
import { CampaignFormValues } from "./page";


type Props = {
  initialValues?: CampaignFormValues;
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
  } = useForm<CampaignFormValues>({
    defaultValues: initialValues ?? {
      titulo: "",
      descripcion: "",
      objetivo: 0,
      fecha_Inicio: "",
      fecha_Fin: "",
    },
  });

  /* ===============================
     RESET AL EDITAR
  ================================ */

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    } else {
      reset({
        titulo: "",
        descripcion: "",
        objetivo: 1,
        fecha_Inicio: "",
        fecha_Fin: "",
      });
    }
  }, [initialValues, reset]);

  const submit = async (data: CampaignFormValues) => {
    onSubmit(data);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)}>
      <div className={styles.field}>
        <label>Título</label>
        <Input {...register("titulo", { required: "Obligatorio" })} />
        {errors.titulo && (
          <span className={styles.error}>{errors.titulo.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label>Descripción</label>
        <Textarea
          rows={3}
          {...register("descripcion", { required: "Obligatorio" })}
        />
        {errors.descripcion && (
          <span className={styles.error}>{errors.descripcion.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label>Fecha Inicio</label>
        <Input
          type="date"
          {...register("fecha_Inicio", {
            required: "Obligatorio",
          })}
        />
      </div>

      <div className={styles.field}>
        <label>Fecha Fin</label>
        <Input
          type="date"
          {...register("fecha_Fin", {
            required: "Obligatorio",
          })}
        />
      </div>

      <div className={styles.field}>
        <label>Objetivo</label>
        <Input
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

          {errors.estado && (
            <span className={styles.error}>{errors.estado.message}</span>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialValues ? "Guardar cambios" : "Agregar"}
        </Button>
      </div>
    </form>
  );
}
