'use client'

import { useState } from "react";
import styles from "@/styles/userPanel.module.css";

import MyAccount from "@/components/pages/MyAccount";
import UserAndPass from "@/components/pages/User&Pass";
import Data from "@/components/pages/Data";

export default function Panel() {
    const [activeSection, setActiveSection] = useState<'data' | 'user&pass' | 'cupons'>('data');

    return (
        <div className={styles.PanelLayout}>
            <main className={styles.Panel}>
                <section className={styles.Content}>
                    {activeSection === 'data' && <Data/>}
                    {activeSection === 'user&pass' && <UserAndPass/>}
                </section>
                <MyAccount onChangeSection={setActiveSection}/>
            </main>
        </div>
    )
}