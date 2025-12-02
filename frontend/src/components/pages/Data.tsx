'use client'

import styles from '@/styles/data.module.css'

export default function Data() {

    return (
        <main className={styles.Content}>
            <h1>Mis Datos</h1>
            <form action="">
                <section className={styles.Personaldata}>
                    <h2>Datos Personales</h2>
                    <div className={styles.PersonalFields}>
                        <label className={styles.Labeldni} htmlFor="dni">Número de DNI:</label>
                        <input className={styles.Dni} type="text" />
                        <label className={styles.LabelName} htmlFor="fname">Nombre:</label>
                        <input className={styles.FirstName} type="text" />
                        <label className={styles.Labelastn} htmlFor="lname">Apellido:</label>
                        <input className={styles.LastName} type="text" />
                        <label className={styles.Labeltel} htmlFor="tel">Telefono:</label>
                        <input className={styles.tel} type="text" />
                    </div>       
                </section>
                <input type="submit" value="Guardar Cambios"/>
            </form>
        </main>
    )
}