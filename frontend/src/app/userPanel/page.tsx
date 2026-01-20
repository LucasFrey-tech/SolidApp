'use client'

import { useEffect,useState } from "react";

import styles from "@/styles/userPanel.module.css";

import MyAccount from "@/components/pages/MyAccount";
import UserAndPass from "@/components/pages/User&Pass";
import UserData from "@/components/pages/data/userData";
import EmpresaData from "@/components/pages/data/empresaData";
import OrganizacionData from "@/components/pages/data/organizacionData";


export default function Panel() {
    const [activeSection, setActiveSection] = useState<'data' | 'user&pass' | 'cupons'>('data');
    const [userType, setUserType] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserType = () => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.log("No se encontró token");
                setLoading(false);
                return;
            }

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));

                const tipo = payload.userType || 'usuario';
                console.log(`Tipo de usuario desde token: ${tipo}`);
                
                setUserType(tipo);
            } catch (error) {
                console.error("Error al decodificar token:", error);
            } finally {
                setLoading(false);
            }
        };

        getUserType();
    }, []);

    const renderDataSection = () => {
        if (loading) {
            return (
                <div className={styles.spinnerContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando datos del usuario...</p>
                </div>
            );
        }

        switch (userType) {
            case 'usuario': 
                return <UserData/>;
            case 'empresa':
                return <EmpresaData/>;
            case 'organizacion':
                return <OrganizacionData/>;
            default:
                return <UserData/>
        }
    }

    return (
        <div className={styles.PanelLayout}>
            <main className={styles.Panel}>
                <section className={styles.Content}>
                    {activeSection === 'data' && renderDataSection()}
                    {activeSection === 'user&pass' && <UserAndPass />}
                </section>
                <MyAccount onChangeSection={setActiveSection} />
            </main>
        </div>
    )
}
