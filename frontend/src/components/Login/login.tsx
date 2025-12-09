"use client";

import { useState } from "react";
import styles from "./loginForm.module.css";

// ==================== TIPOS ====================
interface LoginFormData {
  correo: string;
  clave: string;
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    correo: "",
    clave: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    console.log("Iniciar sesión:", formData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Iniciar sesión</h2>

      <input
        className={styles.input}
        type="email"
        placeholder="Correo"
        name="correo"
        value={formData.correo}
        onChange={handleChange}
      />

      <input
        className={styles.input}
        type="password"
        placeholder="Contraseña"
        name="clave"
        value={formData.clave}
        onChange={handleChange}
      />

      <button className={styles.submitBtn} type="submit">
        Entrar
      </button>
    </form>
  );
}
