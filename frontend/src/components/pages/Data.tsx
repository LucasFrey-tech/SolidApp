'use client';

import styles from '@/styles/data.module.css';

export default function Data() {
  return (
    <main className={styles.Content}>
      <form className={styles.Form}>
        {/* ===== DATOS PERSONALES ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Datos personales</h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Número de DNI</label>
              <input
                className={styles.Input}
                type="number"
                inputMode="numeric"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Nombre</label>
              <input className={styles.Input} type="text" />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Apellido</label>
              <input className={styles.Input} type="text" />
            </div>
          </div>
        </section>

        {/* ===== DIRECCIÓN ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Información de dirección</h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Calle</label>
              <input className={styles.Input} type="text" />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Número</label>
              <input
                className={styles.Input}
                type="number"
                inputMode="numeric"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>
                Departamento <span className={styles.Optional}>(opcional)</span>
              </label>
              <input className={styles.Input} type="text" />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Código Postal</label>
              <input
                className={styles.Input}
                type="number"
                inputMode="numeric"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Provincia</label>
              <select className={styles.Select}>
                <option>Seleccionar</option>
              </select>
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Ciudad</label>
              <select className={styles.Select}>
                <option>Seleccionar</option>
              </select>
            </div>
          </div>
        </section>

        {/* ===== CONTACTO ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Información de contacto</h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Prefijo</label>
              <input
                className={styles.Input}
                type="number"
                inputMode="numeric"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Teléfono</label>
              <input
                className={styles.Input}
                type="number"
                inputMode="numeric"
              />
            </div>
          </div>
        </section>

        <button type="submit" className={styles.SubmitButton}>
          Guardar cambios
        </button>
      </form>
    </main>
  );
}
