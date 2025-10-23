'use client'

import styles from '@/styles/user&pass.module.css';

export default function UserAndPass () {

    return (
        <main className={styles.content}>
            <form action="">
                <section className={styles.UserAndPass}>
                    <h1>Usuario y Contraseña</h1>
                    <div>
                        <h2>Email de Usuario</h2>
                        <label htmlFor="Email">Correo Electronico</label>
                        <input className={styles.Email} type="email"/>
                    </div>
                    
                    <div>
                        <h2>Si deseas actualizar tu contraseña, hacelo aqui</h2>
                        <label htmlFor="CurrentPass">Contraseña Actual</label>
                        <input className={styles.Currentpass} type="password" />
                        <label htmlFor="NewPass">Contraseña Nueva</label>
                        <input className={styles.Newpass} type="text" />
                        <label htmlFor="Confirmation">Repetir Contraseña Nueva</label>
                        <input className={styles.Confirmation} type="text" />
                    </div>
                </section>
                <input type="submit" value="Guardar Cambios"/>
            </form>
        </main>
    )   
}