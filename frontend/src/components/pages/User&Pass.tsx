'use client';

import styles from '@/styles/user&pass.module.css';

export default function UserAndPass() {
  return (
    <main className={styles.Container}>
      <form className={styles.Form}>
        <h1 className={styles.Title}>Usuario y Contraseña</h1>

        {/* EMAIL */}
        <section className={styles.Block}>
          <h2 className={styles.Subtitle}>Email de Usuario</h2>

          <label className={styles.Label}>Correo electrónico</label>
          <input
            type="email"
            className={styles.Input}
            placeholder="tu@email.com"
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
          />

          <label className={styles.Label}>Nueva contraseña</label>
          <input
            type="password"
            className={styles.Input}
            placeholder="••••••••"
          />

          <label className={styles.Label}>Repetir nueva contraseña</label>
          <input
            type="password"
            className={styles.Input}
            placeholder="••••••••"
          />
        </section>

        <button type="submit" className={styles.SubmitButton}>
          Guardar cambios
        </button>
      </form>
    </main>
  );
}
