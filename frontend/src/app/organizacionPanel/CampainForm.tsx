"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import styles from "@/styles/campaignPanel.module.css";

type FormData = {
  titulo: string;
  descripcion: string;
  objetivo: number;
  puntosCampaña: number;
};

export function CampaignForm({
  campaign,
  onClose,
  onSuccess,
}: {
  campaign?: FormData;
  onClose: () => void;
  onSuccess: (data: FormData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: campaign || {
      titulo: "",
      descripcion: "",
      objetivo: 0,
      puntosCampaña: 0,
    },
  });

  const submit = (data: FormData) => {
    onSuccess(data);
    onClose();
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
          <span className={styles.error}>
            {errors.descripcion.message}
          </span>
        )}
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

      <div className={styles.field}>
        <label>Puntos de la campaña (c/u item)</label>
        <Input
          type="number"
          {...register("puntosCampaña", {
            required: "Obligatorio",
            valueAsNumber: true,
            min: { value: 0, message: "No puede ser negativo" },
          })}
        />
        {errors.puntosCampaña && (
          <span className={styles.error}>
            {errors.puntosCampaña.message}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <Button variant="outline" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {campaign ? "Guardar cambios" : "Agregar"}
        </Button>
      </div>
    </form>
  );
}
