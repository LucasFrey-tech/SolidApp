"use client";

import styles from "@/styles/user&pass.module.css";
import { useEffect, useState, useMemo } from "react";
import { BaseApi } from "@/API/baseApi";
import { useUser } from "@/app/context/UserContext";

type UserType = "usuario" | "empresa" | "organizacion";

type AuthData = {
  userId: number;
  userType: UserType;
};

export default function UserAndPass() {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [correo, setCorreo] = useState("");
  const [correoOriginal, setCorreoOriginal] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmacion, setPasswordConfirmacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { setUser, refreshUser } = useUser();

  const api = useMemo(() => {
    const token = localStorage.getItem("token");
    return new BaseApi(token || undefined);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1]));

    setAuthData({
      userId: payload.sub,
      userType: payload.userType as UserType,
    });
  }, []);

  useEffect(() => {
    if (!authData) return;

    const fetchCorreo = async () => {
      try {
        let response;

        switch (authData.userType) {
          case "usuario":
            response = await api.users.getOne(authData.userId);
            break;
          case "empresa":
            response = await api.empresa.getOne(authData.userId);
            break;
          case "organizacion":
            response = await api.organizacion.getOne(authData.userId);
            break;
          default:
            return;
        }

        setCorreo(response.correo);
        setCorreoOriginal(response.correo);
      } catch {
        setError("No se pudo cargar el correo actual");
      }
    };

    fetchCorreo();
  }, [authData]);

  if (!authData) {
    return <p>Cargando...</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Crear payload vacío
    const payload: any = {};

    // 1. EMAIL: Siempre enviar si es diferente
    if (correo.trim() !== correoOriginal.trim()) {
      payload.correo = correo.trim();
    }

    // 2. CONTRASEÑA NUEVA: Solo si se ingresa
    if (passwordNueva) {
      // Validar que las contraseñas coincidan
      if (passwordNueva !== passwordConfirmacion) {
        setError("Las contraseñas nuevas no coinciden");
        return;
      }

      // Si hay nueva contraseña, REQUIERE passwordActual
      if (!passwordActual) {
        setError(
          "Para cambiar la contraseña debés ingresar la contraseña actual",
        );
        return;
      }

      payload.passwordActual = passwordActual;
      payload.passwordNueva = passwordNueva;
    }

    // 4. Verificar que haya algo para cambiar
    if (Object.keys(payload).length === 0) {
      setError("No hay cambios para guardar");
      return;
    }

    try {
      let response;
      switch (authData!.userType) {
        case "usuario":
          response = await api.users.updateCredentials(authData!.userId, payload);
          break;
        case "empresa":
          response = await api.empresa.updateCredentials(authData!.userId, payload);
          break;
        case "organizacion":
          response = await api.organizacion.updateCredentials(authData!.userId, payload);
          break;
        default:
          throw new Error("Tipo de usuario inválido");
      }

      setSuccess("Credenciales actualizadas correctamente");

      if (response.token) {
        localStorage.setItem("token", response.token);
        refreshUser();
      }

      // Actualizar correoOriginal si cambió el email
      if (payload.correo) {
        setCorreoOriginal(payload.correo);
        setUser({
          email: payload.correo,
          sub: authData!.userId,
          username: payload.correo.split("@")[0],
        });
      }

      // Limpiar campos
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirmacion("");
    } catch (err: any) {
      setError(err.message || "Error al actualizar credenciales");
    }
  };

  return (
    <main className={styles.Container}>
      <form className={styles.Form} onSubmit={handleSubmit}>
        <h1 className={styles.Title}>Usuario y Contraseña</h1>

        {/* EMAIL */}
        <section className={styles.Block}>
          <h2 className={styles.Subtitle}>Email de Usuario</h2>

          <label className={styles.Label}>Correo electrónico</label>
          <input
            type="email"
            className={styles.Input}
            placeholder="tu@email.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </section>

        {/* PASSWORD */}
        <section className={styles.Block}>
          <h2 className={styles.Subtitle}>Actualizar contraseña</h2>

          <label className={styles.Label}>Contraseña actual</label>
          <input
            type="password"
            className={styles.Input}
            placeholder="••••••••"
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
          />

          <label className={styles.Label}>Nueva contraseña</label>
          <input
            type="password"
            className={styles.Input}
            placeholder="••••••••"
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
          />

          <label className={styles.Label}>Repetir nueva contraseña</label>
          <input
            type="password"
            className={styles.Input}
            placeholder="••••••••"
            value={passwordConfirmacion}
            onChange={(e) => setPasswordConfirmacion(e.target.value)}
          />
        </section>

        {success && (
          <div className={styles.SuccessMessage}>
            ¡Cambios guardados exitosamente!
          </div>
        )}

        {error && <div className={styles.ErrorMessage}>Error: {error}</div>}

        <button type="submit" className={styles.SubmitButton}>
          Guardar cambios
        </button>
      </form>
    </main>
  );
}
