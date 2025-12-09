'use client';
import styles from "@/styles/myAccountMenu.module.css";
import Image from "next/image";

type MyAccountProps = {
    readonly onChangeSection: (section: 'data' | 'user&pass' | 'cupons') => void
}

// user menu

export default function MyAccount({onChangeSection}: MyAccountProps) {
    
    return (
        <section className={styles.AccountMenu}> 
            <main className={styles.MenuLayer}> 
                <h1>Mi cuenta</h1>
                <div className={styles.User}>
                    <Image src="/logos/user_logo.svg" alt="Icono de Usuario" width={48} height={48}/>
                    <p className={styles.UserName}></p>
                    <p className={styles.Email}></p>
                </div>

                <div className={styles.Menu}>
                    <ul className={styles.List}>
                        <li><button onClick={() => onChangeSection('cupons')}>Mis Cupones</button></li>
                        <li><button onClick={() => onChangeSection('data')}>Mis Datos</button></li>
                        <li><button onClick={() => onChangeSection('user&pass')}>Usuario y Contraseña</button></li>
                        <li>Ayuda</li>
                        <li>Cerrar Sesion</li>
                    </ul>
                </div>
            </main>
        </section>
    )
}