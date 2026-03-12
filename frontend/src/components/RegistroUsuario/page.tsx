"use client";

import { useState } from "react";
import { z } from "zod";
import styles from "@/styles/login-registro/registro.module.css";
import Swal from "sweetalert2";
import { baseApi } from "@/API/baseApi";

const usuarioSchema = z
  .object({
    documento: z
      .string()
      .min(1, "El documento es obligatorio")
      .min(7, "El documento debe tener al menos 7 caracteres"),

    correo: z
      .string()
      .min(1, "El email es obligatorio")
      .email("Email inválido"),

    clave: z
      .string()
      .min(1, "La contraseña es obligatoria")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),

    confirmarClave: z.string().min(1, "Repetí la contraseña"),

    nombre: z
      .string()
      .min(1, "El nombre es obligatorio")
      .min(2, "El nombre debe tener al menos 2 caracteres"),

    apellido: z
      .string()
      .min(1, "El apellido es obligatorio")
      .min(2, "El apellido debe tener al menos 2 caracteres"),
  })
  .refine((data) => data.clave === data.confirmarClave, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarClave"],
  });

type UsuarioData = z.infer<typeof usuarioSchema>;
type RegistroUsuarioProps = { onRegisterSuccess: () => void; };

export default function RegistroUsuario({ onRegisterSuccess }: RegistroUsuarioProps) {
  const [data, setData] = useState<UsuarioData>({
    documento: "",
    correo: "",
    clave: "",
    confirmarClave: "",
    nombre: "",
    apellido: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      usuarioSchema.parse(data);

      const { confirmarClave, ...dto } = data;
      await baseApi.auth.register(dto);

      await Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Tu cuenta fue creada correctamente",
      });
      onRegisterSuccess();
      
      setData({
        documento: "",
        correo: "",
        clave: "",
        confirmarClave: "",
        nombre: "",
        apellido: "",
      });

      setErrors({});
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};

        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });

        setErrors(newErrors);
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Revisá los campos",
      });
    }
  };

  return (
    <div className={styles.formWrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Registro de Usuario</h2>

        <div className={styles.scrollableFields}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Documento</label>
            <input
              className={`${styles.input} ${errors.documento ? styles.inputError : ""
                }`}
              placeholder="Documento"
              value={data.documento}
              onChange={(e) => handleChange("documento", e.target.value)}
            />
            {errors.documento && (
              <span className={styles.errorText}>{errors.documento}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Correo electrónico</label>
            <input
              className={`${styles.input} ${errors.correo ? styles.inputError : ""
                }`}
              placeholder="Correo electrónico"
              value={data.correo}
              onChange={(e) => handleChange("correo", e.target.value)}
            />
            {errors.correo && (
              <span className={styles.errorText}>{errors.correo}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Contraseña</label>
            <input
              type="password"
              className={`${styles.input} ${errors.clave ? styles.inputError : ""
                }`}
              placeholder="Contraseña"
              value={data.clave}
              onChange={(e) => handleChange("clave", e.target.value)}
            />
            {errors.clave && (
              <span className={styles.errorText}>{errors.clave}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Repetir contraseña</label>
            <input
              type="password"
              className={`${styles.input} ${errors.confirmarClave ? styles.inputError : ""
                }`}
              placeholder="Repetir contraseña"
              value={data.confirmarClave}
              onChange={(e) => handleChange("confirmarClave", e.target.value)}
            />
            {errors.confirmarClave && (
              <span className={styles.errorText}>{errors.confirmarClave}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Nombre</label>
            <input
              className={`${styles.input} ${errors.nombre ? styles.inputError : ""
                }`}
              placeholder="Nombre"
              value={data.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
            />
            {errors.nombre && (
              <span className={styles.errorText}>{errors.nombre}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Apellido</label>
            <input
              className={`${styles.input} ${errors.apellido ? styles.inputError : ""
                }`}
              placeholder="Apellido"
              value={data.apellido}
              onChange={(e) => handleChange("apellido", e.target.value)}
            />
            {errors.apellido && (
              <span className={styles.errorText}>{errors.apellido}</span>
            )}
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.btn}>
            Registrarme
          </button>

          <p className={styles.requiredHint}>
            Los campos con * son obligatorios
          </p>
        </div>
      </form>
    </div>
  );
}
