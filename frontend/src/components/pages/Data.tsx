'use client'

import styles from '@/styles/data.module.css'

export default function Data() {

    return (
        <main className={styles.Content}>
            <h1>Mis Datos</h1>
            <form className={styles.Form} action="">
                <section className={styles.PersonalData}>
                    <h2>Datos Personales</h2>
                    <div className={styles.PersonalFields}>
                        <label className={styles.Labeldni} htmlFor="dni">Número de DNI:</label>
                        <input className={styles.Dni} type="text" />
                        <label className={styles.LabelName} htmlFor="fname">Nombre:</label>
                        <input className={styles.FirstName} type="text" />
                        <label className={styles.Labelastn} htmlFor="lname">Apellido:</label>
                        <input className={styles.LastName} type="text" />
                    </div>
                    
                    <h2>Información de Dirección</h2>
                    <div className={styles.AdressFields}>
                        <label className={styles.LabelStreet} htmlFor="sname">Calle:</label>
                        <input className={styles.Street} type="text" />
                        <label className={styles.LabelStreetNumber} htmlFor="snumber">Numero:</label>
                        <input className={styles.Number} type="text"/>
                        <label className={styles.LabelDepartment} htmlFor="dep">Departamento:<strong>(opcional)</strong></label>
                        <input className={styles.Department} type="text"/>
                        <label className={styles.LabelPC} htmlFor="PC">Código Postal</label>
                        <input className={styles.PC} type="text" />
                        <label className={styles.LabelState} htmlFor="state">Provincia</label>
                        <select name="state" id="state">
                            {/**
                             * Opciones de provincias
                             */}
                        </select>
                        <label className={styles.LabelCity} htmlFor="city">Ciudad</label>
                        <select name="city" id="city">
                            {/**
                             * Opciones de ciudades
                             */}
                        </select>
                    </div>
                    
                    <h2>Información de Contacto</h2>
                    <div className={styles.ContactFields}>
                        <label className={styles.LabelAreaCode} htmlFor="areaCode">Prefijo</label>
                        <input className={styles.AreaCode} type="text" />
                        <label className={styles.Labeltel} htmlFor="tel">Telefono:</label>
                        <input className={styles.tel} type="text" />
                    </div>
                </section>
                <input type="submit" value="Guardar Cambios"/>
            </form>
        </main>
    )
}