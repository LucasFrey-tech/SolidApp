"use client";

import { useState } from "react";
import styles from "@/styles/login-registro/registro.module.css";
import { baseApi } from "@/API/baseApi";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import Swal from "sweetalert2";

import { Rol } from "@/API/types/auth";
import { GestionTipo } from "@/API/types/gestion/enum";

interface LoginData {
  correo: string;
  clave: string;
}

interface Errors {
  correo?: string;
  clave?: string;
}

interface DecodedToken {
  email: string;
  sub: number;
  username: string;
  rol: Rol;
  gestion: GestionTipo | null;
  gestionId: number | null;
}

export default function Login() {
  const router = useRouter();
  const { setUser, refreshUser } = useUser();

  const [loginData, setLoginData] = useState<LoginData>({
    correo: "",
    clave: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return "El email es obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email inválido";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "La contraseña es obligatoria";
    if (password.length < 6) return "Mínimo 6 caracteres";
    return "";
  };

  const handleChange = (field: keyof LoginData, value: string) => {
    setLoginData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Errors = {
      correo: validateEmail(loginData.correo),
      clave: validatePassword(loginData.clave),
    };

    setErrors(newErrors);

    return !newErrors.correo && !newErrors.clave;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      

      const res = await baseApi.auth.login({
        ...loginData,
      });

      const token = res.token;

      localStorage.setItem("token", token);

      const decoded = jwtDecode<DecodedToken>(token);

      setUser({
        email: decoded.email,
        sub: decoded.sub,
        username: decoded.username,
        rol: decoded.rol,
        gestion: decoded.gestion,
        gestionId: decoded.gestionId,
      });

      refreshUser();

      await Swal.fire({
        icon: "success",
        title: "Login exitoso",
        timer: 1500,
        showConfirmButton: false,
      });

      router.replace("/inicio");

    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: error?.message || "Error desconocido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registroContainer}>
      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={handleLogin}>
          <h2 className={styles.title}>Iniciar sesión</h2>

          <h3 className={styles.textosLabel}>Ingresa tu correo electrónico</h3>
          <input
            className={styles.input}
            type="email"
            placeholder="Correo electrónico"
            value={loginData.correo}
            onChange={(e) => handleChange("correo", e.target.value)}
          />

          {errors.correo && (
            <span className={styles.errorText}>{errors.correo}</span>
          )}
          <h3 className={styles.textosLabel}>Ingresa tu contraseña</h3>
          <input
            className={styles.input}
            type="password"
            placeholder="Contraseña"
            value={loginData.clave}
            onChange={(e) => handleChange("clave", e.target.value)}
          />

          {errors.clave && (
            <span className={styles.errorText}>{errors.clave}</span>
          )}

          <button className={styles.btn} disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}