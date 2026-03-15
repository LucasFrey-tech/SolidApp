"use client";

import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { baseApi } from "@/API/baseApi";
import { Empresa, EmpresaUpdateRequest } from "@/API/types/empresas";
import styles from "@/styles/Paneles/empresaInfo.module.css";
import { useUser } from "@/app/context/UserContext";
import Image from "next/image";

function cleanObject(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v !== "" && v !== null && v !== undefined,
    ),
  );
}

export default function EmpresaInfo() {
  const { user } = useUser();
  const isGestor = user?.rol?.toUpperCase() === "GESTOR";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [emp, setOrg] = useState<Empresa | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [form, setForm] = useState({
    nombre_empresa: "",
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
    logo: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerfil();
  }, []);

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const fetchPerfil = async () => {
    try {
      const data = await baseApi.empresa.getPerfil();

      console.log("Logo recibido:", data.logo);

      setOrg(data);
      setLogoPreview(data.logo ?? "");

      setForm({
        nombre_empresa: data.nombre_empresa ?? "",
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
        logo: data.logo ?? "",
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo cargar la empresa", "error");
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire("Error", "Por favor selecciona una imagen válida", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Error", "La imagen no debe superar los 2MB", "error");
      return;
    }

    setLogoFile(file);

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  const handleSave = async () => {
    if (!isGestor) return;

    try {
      const payload: EmpresaUpdateRequest = cleanObject({
        nombre_empresa: form.nombre_empresa,
        razon_social: form.razon_social,
        cuit: form.cuit,
        web: form.web,
        descripcion: form.descripcion,
        contacto: cleanObject({
          prefijo: form.prefijo,
          telefono: form.telefono,
        }),
        direccion: cleanObject({
          calle: form.calle,
          numero: form.numero,
          provincia: form.provincia,
          ciudad: form.ciudad,
          codigo_postal: form.codigo_postal,
        }),
      });

      await baseApi.empresa.updatePerfil(payload, logoFile);

      Swal.fire("Guardado", "Datos actualizados correctamente", "success");

      setLogoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchPerfil();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar la Empresa", "error");
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!emp) return <p>No se encontró la Empresa</p>;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Información de la Empresa</h3>

      {!isGestor && (
        <p className={styles.notice}>
          Solo los gestores pueden modificar la información.
        </p>
      )}

      <div className={styles.grid}>
        <div className={styles.formGroup}>
          <label>Nombre de la Empresa</label>
          <input
            className={styles.input}
            value={form.nombre_empresa}
            disabled={!isGestor}
            onChange={(e) => handleChange("nombre_empresa", e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Razón social</label>
          <input
            className={styles.input}
            value={form.razon_social}
            disabled={!isGestor}
            onChange={(e) => handleChange("razon_social", e.target.value)}
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

        <div className={styles.formGroup}>
          <label>Imagen (Logo)</label>

          <div style={{ marginBottom: "10px" }}>
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Preview Logo"
                width={200}
                height={200}
                style={{ objectFit: "contain", borderRadius: "8px" }}
              />
            ) : emp?.logo ? (
              <Image
                src={emp.logo}
                alt="Logo Empresa"
                width={200}
                height={200}
                style={{ objectFit: "contain", borderRadius: "8px" }}
              />
            ) : (
              <div style={{ fontSize: "14px", color: "#777" }}>
                No hay imagen cargada
              </div>
            )}
          </div>

          {isGestor && (
            <>
              <input
                ref={fileInputRef}
                id="logoUpload"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ display: "none" }}
              />

              <button
                type="button"
                className={styles.uploadButton}
                onClick={() => document.getElementById("logoUpload")?.click()}
              >
                Agregar / Cambiar Imagen
              </button>
            </>
          )}
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
