"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { baseApi } from "@/API/baseApi";
import {
    Organizacion,
    OrganizacionUpdateRequest,
} from "@/API/types/organizaciones";
import styles from "@/styles/Paneles/organizacionInfo.module.css";
import { useUser } from "@/app/context/UserContext";

export default function OrganizationInfo() {
    const { user } = useUser();
    const isGestor = user?.rol?.toUpperCase() === "GESTOR";

    const [org, setOrg] = useState<Organizacion | null>(null);

    const [form, setForm] = useState({
        nombre_organizacion: "",
        razon_social: "",
        cuit: "",
        web: "",
        descripcion: "",
        prefijo: "",
        telefono: "",
        calle: "",
        numero: "",
        provincia: "",
        ciudad: "",
        codigo_postal: "",
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPerfil();
    }, []);

    const fetchPerfil = async () => {
        try {
            const data = await baseApi.organizacion.getPerfil();

            setOrg(data);

            setForm({
                nombre_organizacion: data.nombre_organizacion ?? "",
                razon_social: data.razon_social ?? "",
                cuit: data.cuit ?? "",
                web: data.web ?? "",
                descripcion: data.descripcion ?? "",
                prefijo: data.contacto.prefijo ?? "",
                telefono: data.contacto.telefono ?? "",
                calle: data.direccion.calle ?? "",
                numero: data.direccion.numero ?? "",
                provincia: data.direccion.provincia ?? "",
                ciudad: data.direccion.ciudad ?? "",
                codigo_postal: data.direccion.codigo_postal ?? "",
            });
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo cargar la organización", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        if (!isGestor) return;

        try {
            await baseApi.organizacion.updatePerfil(form);

            Swal.fire("Guardado", "Datos actualizados correctamente", "success");

            fetchPerfil();
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo actualizar la organización", "error");
        }
    };

    if (loading) return <p>Cargando...</p>;
    if (!org) return <p>No se encontró la organización</p>;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Información de la Organización</h3>

            {!isGestor && (
                <p className={styles.notice}>
                    Solo los gestores pueden modificar la información.
                </p>
            )}

            <div className={styles.grid}>
                <div className={styles.formGroup}>
                    <label>Nombre de la organización</label>
                    <input
                        className={styles.input}
                        value={form.nombre_organizacion}
                        disabled={!isGestor}
                        onChange={(e) =>
                            handleChange("nombre_organizacion", e.target.value)
                        }
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Razón social</label>
                    <input
                        className={styles.input}
                        value={form.razon_social}
                        disabled={!isGestor}
                        onChange={(e) =>
                            handleChange("razon_social", e.target.value)
                        }
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>CUIT</label>
                    <input
                        className={styles.input}
                        value={form.cuit}
                        disabled={!isGestor}
                        onChange={(e) => handleChange("cuit", e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Sitio web</label>
                    <input
                        className={styles.input}
                        value={form.web}
                        disabled={!isGestor}
                        onChange={(e) => handleChange("web", e.target.value)}
                    />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Descripción</label>
                    <textarea
                        className={styles.textarea}
                        value={form.descripcion}
                        disabled={!isGestor}
                        onChange={(e) => handleChange("descripcion", e.target.value)}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Prefijo</label>
                    <input
                        className={styles.input}
                        value={form.prefijo}
                        disabled={!isGestor}
                        onChange={(e) => handleChange("prefijo", e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Teléfono</label>
                    <input
                        className={styles.input}
                        value={form.telefono}
                        disabled={!isGestor}
                        onChange={(e) => handleChange("telefono", e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Calle</label>
                    <input
                        className={styles.input}
                        value={form.calle}
                        disabled={!isGestor}
                        onChange={(e) => handleChange("calle", e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Número</label>
                    <input
                        className={styles.input}
                        value={form.numero}
                        disabled={!isGestor}
                        onChange={(e) => handleChange("numero", e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Provincia</label>
                    <input
                        className={styles.input}
                        value={form.provincia}
                        disabled={!isGestor}
                        onChange={(e) => handleChange("provincia", e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Ciudad</label>
                    <input
                        className={styles.input}
                        value={form.ciudad}
                        disabled={!isGestor}
                        onChange={(e) => handleChange("ciudad", e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Código Postal</label>
                    <input
                        className={styles.input}
                        value={form.codigo_postal}
                        disabled={!isGestor}
                        onChange={(e) => handleChange("codigo_postal", e.target.value)}
                    />
                </div>

            </div>

            <div className={styles.divider} />

            {isGestor && (
                <div className={styles.actions}>
                    <button className={styles.button} onClick={handleSave}>
                        Guardar cambios
                    </button>
                </div>
            )}
        </div>
    );
}
