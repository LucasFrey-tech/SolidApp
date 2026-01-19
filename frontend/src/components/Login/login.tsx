"use client";

import { useState, useMemo, useEffect } from "react";
import styles from "../../styles/login.module.css";
import Swal from "sweetalert2";
import { BaseApi } from "@/API/baseApi";
import { jwtDecode } from "jwt-decode";

interface LoginFormData {
  correo: string;
  clave: string;
}

export default function Login() {
  console.log("LOGIN MONTADO");

  useEffect(() => {
    Swal.fire("TEST", "SweetAlert funciona", "success");
    console.log("USE EFFECT EJECUTADO");
  }, []);

  const api = useMemo(() => new BaseApi(), []);

  const [formData, setFormData] = useState<LoginFormData>({
    correo: "",
    clave: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await api.log.login(formData);

      if (!res.success) throw new Error(res.error);

      const token = res.data.token;
      localStorage.setItem("token", token);

      const decoded = jwtDecode<{ sub: string }>(token);
      localStorage.setItem("userId", decoded.sub);

      await Swal.fire({
        title: "Login exitoso",
        text: "Redirigiendo...",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (error) {
      Swal.fire({
        title: "Login fallido",
        text:
          error instanceof Error
            ? error.message
            : "Error al iniciar sesión",
        icon: "error",
      });
    }
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
        required
      />

      <input
        className={styles.input}
        type="password"
        placeholder="Contraseña"
        name="clave"
        value={formData.clave}
        onChange={handleChange}
        required
      />

      <button className={styles.submitBtn} type="submit">
        Entrar
      </button>
    </form>
  );
}
