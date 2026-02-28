"use client";

import { useState } from "react";
import Link from "next/link";
import { baseApi } from "@/API/baseApi";
import styles from "@/styles/login-registro/registro.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await baseApi.auth.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError("Error al enviar el email. Intentalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.confirmationContainer}>
        <div className={styles.confirmationBox}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.confirmationTitle}>Revisá tu email</h2>
          <div className={styles.confirmationText}>
            <p>Si el email <strong>{email}</strong> está registrado,</p>
            <p>vas a recibir instrucciones para recuperar tu contraseña.</p>
          </div>
          <div className={styles.confirmationEmail}>{email}</div>
          <Link href="/login" className={styles.backButton}>
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.confirmationContainer}>
      <div className={styles.confirmationBox}>
        <h2 className={styles.confirmationTitle}>Recuperar contraseña</h2>
        <p className={styles.confirmationText}>
          Te enviaremos un enlace a tu email para que puedas restablecer tu
          contraseña.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className={styles.input}
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.btn}>
            {loading ? "Enviando..." : "Enviar instrucciones"}
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