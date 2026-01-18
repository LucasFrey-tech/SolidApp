"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/login.module.css";
import Swal from "sweetalert2";
import { BaseApi } from "@/API/baseApi";
import { jwtDecode } from "jwt-decode";

// ==================== TIPOS ====================
interface LoginFormData {
  correo: string;
  clave: string;
}

export default function Login() {
  const router = useRouter();
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
      const res = await api.log.login({
        correo: formData.correo,
        clave: formData.clave,
      });

      if (!res.success) {
        if (res.status === 403) {
          Swal.fire("Login fallido", "Usuario bloqueado", "error");
          return;
        }
        Swal.fire("Login fallido", "Correo o contraseña incorrectos", "error");
        return;
      }  
      
      const token = res.data.token
      localStorage.setItem("token", token);

      type JwtPayload = { sub: string };
      const decoded = jwtDecode<JwtPayload>(token);
      localStorage.setItem("userId", decoded.sub);

      Swal.fire({
        title: "Iniciando sesión",
        text: "Redirigiendo...",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      });

      console.log("Login exitoso");

      setTimeout(() => {
        router.push("/inicio");
      }, 3000);
      
    } catch (error) {
      console.error("Error en login", error);
      alert("Correo o contraseña incorrectos");
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
