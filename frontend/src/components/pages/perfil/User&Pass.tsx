"use client";

import styles from "@/styles/UserPanel/usuario/user&pass.module.css";
import { useState } from "react";
import { baseApi } from "@/API/baseApi";
import { useUser } from "@/app/context/UserContext";
import { RolCuenta } from "@/API/types/auth";

export default function UserAndPass() {
  const { user, refreshUser } = useUser();

  const [correo, setCorreo] = useState(user?.email ?? "");
  const [correoOriginal, setCorreoOriginal] = useState(user?.email ?? "");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmacion, setPasswordConfirmacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  type UpdateCredentialsPayload = {
    correo?: string;
    passwordActual?: string;
    passwordNueva?: string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload: UpdateCredentialsPayload = {};

    if (correo.trim() !== correoOriginal.trim()) {
      payload.correo = correo.trim();
    }

    if (passwordNueva) {
      if (passwordNueva !== passwordConfirmacion) {
        setError("Las contraseñas nuevas no coinciden");
        return;
      }

      if (!passwordActual) {
        setError(
          "Para cambiar la contraseña debés ingresar la contraseña actual",
        );
        return;
      }

      payload.passwordActual = passwordActual;
      payload.passwordNueva = passwordNueva;
    }

    if (Object.keys(payload).length === 0) {
      setError("No hay cambios para guardar");
      return;
    }

    try {
      switch (user?.role) {
        case RolCuenta.USUARIO:
          await baseApi.users.updateCredenciales(payload);
          break;
        case RolCuenta.EMPRESA:
          await baseApi.empresa.updateCredenciales(payload);
          break;
        case RolCuenta.ORGANIZACION:
          await baseApi.organizacion.updateCredenciales(payload);
          break;
        default:
          throw new Error("Tipo de usuario inválido");
      }

      setSuccess("Credenciales actualizadas correctamente");
      refreshUser();

      if (payload.correo) {
        setCorreoOriginal(payload.correo);
      }

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
