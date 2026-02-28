"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { baseApi } from "@/API/baseApi";
import styles from "@/styles/login-registro/registro.module.css";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className={styles.recoveryContainer}>
        <div className={styles.recoveryBox}>
          <h2 className={styles.recoveryTitle}>Link inválido</h2>
          <p className={styles.recoverySubtitle}>
            El enlace de recuperación no es válido o ha expirado.
          </p>
          <Link href="/forgot-password" className={styles.backLink}>
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await baseApi.auth.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError("Error al restablecer la contraseña. El token puede haber expirado.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.recoveryContainer}>
        <div className={styles.recoveryBox}>
          <h2 className={styles.recoveryTitle}>¡Contraseña actualizada!</h2>
          <div className={styles.successMessage}>
            <p>Tu contraseña se actualizó correctamente.</p>
            <p className={styles.redirectCountdown}>Serás redirigido al login en unos segundos...</p>
            <Link href="/login" className={styles.backLink}>
              Ir al login ahora
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.recoveryContainer}>
      <div className={styles.recoveryBox}>
        <h2 className={styles.recoveryTitle}>Nueva contraseña</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí tu contraseña"
              required
              className={styles.input}
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className={styles.btn}
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>

          <div className={styles.switchForm}>
            <Link href="/login" className={styles.link}>
              ← Volver al login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}