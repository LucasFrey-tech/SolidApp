"use client";

import { baseApi } from "@/API/baseApi";
import { useUser } from "@/app/context/UserContext";
import { GestionTipo } from "@/API/types/gestion/enum";
import { Empresa } from "@/API/types/empresas";
import { Organizacion } from "@/API/types/organizaciones";
import { NumericInput } from "@/components/Utils/NumericInputProp";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import styles from "@/styles/UserPanel/data/gestionData.module.css";

interface GestionDataProps {
  tipo: GestionTipo.EMPRESA | GestionTipo.ORGANIZACION;
}

type EditableGestionFields = {
  descripcion: string;
  prefijo: string;
  telefono: string;
  calle: string;
  numero: string;
  provincia: string;
  ciudad: string;
  codigo_postal: string;
  web: string;

  actividad?: string;
  logo?: string;
};

const defaultEditableData: EditableGestionFields = {
  descripcion: "",
  prefijo: "",
  telefono: "",
  calle: "",
  numero: "",
  provincia: "",
  ciudad: "",
  codigo_postal: "",
  web: "",
  actividad: "",
  logo: "",
};

export default function GestionData({ tipo }: GestionDataProps) {
  const [gestionData, setGestionData] = useState<Empresa | Organizacion | null>(
    null,
  );
  const [editableData, setEditableData] =
    useState<EditableGestionFields>(defaultEditableData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { user } = useUser();

  const isEmpresa = tipo === GestionTipo.EMPRESA;

  useEffect(() => {
    const fetchGestionData = async () => {
      if (!user?.sub) return;

      setLoading(true);
      setError(null);

      try {
        const relaciones = await baseApi.usuario.getPerfil();

        let gestionId: number | null = null;

        if (isEmpresa) {
          gestionId = (relaciones as any)?.empresaId || null;
        } else {
          gestionId = (relaciones as any)?.organizacionId || null;
        }

        if (!gestionId) {
          throw new Error(
            `No se encontró ${isEmpresa ? "empresa" : "organización"} asociada al usuario`,
          );
        }

        let response;
        if (isEmpresa) {
          response = await baseApi.empresa.getPerfil();
        } else {
          response = await baseApi.organizacion.getPerfil();
        }

        if (!response) {
          throw new Error(
            `Error al obtener los datos de la ${isEmpresa ? "empresa" : "organización"}`,
          );
        }

        setGestionData(response);

        const {
          descripcion = "",
          prefijo = "",
          telefono = "",
          calle = "",
          numero = "",
          provincia = "",
          ciudad = "",
          codigo_postal = "",
          web = "",
        } = response;

        setEditableData({
          descripcion,
          prefijo,
          telefono,
          calle,
          numero,
          provincia,
          ciudad,
          codigo_postal,
          web,
          ...(isEmpresa && {
            actividad: (response as Empresa).actividad || "",
            logo: (response as Empresa).logo || "",
          }),
        });
      } catch (error) {
        console.error(
          `Error fetching ${isEmpresa ? "empresa" : "organización"} data:`,
          error,
        );
        setError(error instanceof Error ? error.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchGestionData();
  }, [user?.sub, isEmpresa]);

  const handleInputChange = useCallback(
    (field: keyof EditableGestionFields, value: string) => {
      setEditableData((prev) => ({
        ...prev,
        [field]: value,
      }));
      setSuccess(false);
      setError(null);
    },
    [],
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isEmpresa) return; // Solo para empresa

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gestionData || !user?.sub) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const cambios: Partial<EditableGestionFields> = {};

      const campos: (keyof EditableGestionFields)[] = [
        "descripcion",
        "prefijo",
        "telefono",
        "calle",
        "numero",
        "provincia",
        "ciudad",
        "codigo_postal",
        "web",
      ];

      if (isEmpresa) {
        campos.push("actividad");
      }

      campos.forEach((campo) => {
        const valorActual = (gestionData as any)[campo] ?? "";
        const valorNuevo = editableData[campo] ?? "";
        if (valorNuevo !== valorActual) {
          cambios[campo] = valorNuevo;
        }
      });

      if (Object.keys(cambios).length === 0 && !selectedFile) {
        setSuccess(true);
        setSaving(false);
        return;
      }

      let updated;
      if (isEmpresa) {
        updated = await baseApi.empresa.updatePerfil(
          cambios,
          selectedFile || undefined,
        );
      } else {
        updated = await baseApi.organizacion.updatePerfil(cambios);
      }

      setGestionData(updated);
      setSelectedFile(null);
      setPreview(null);
      setSuccess(true);
    } catch (error) {
      console.error(
        `Error en update ${isEmpresa ? "empresa" : "organización"}:`,
        error,
      );
      setError(
        error instanceof Error ? error.message : "Error al guardar cambios",
      );
    } finally {
      setSaving(false);
    }
  };

  const onlyLettersAndSpaces = (value: string) =>
    value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");

  const onlyLettersNumbers = (value: string) =>
    value.replace(/[^A-Za-z0-9]/g, "");

  if (loading)
    return (
      <div>
        Cargando datos de {isEmpresa ? "la empresa" : "la organización"}...
      </div>
    );
  if (error) return <div>Error: {error}</div>;
  if (!gestionData) return <div>No se encontraron datos</div>;

  return (
    <main className={styles.Content}>
      <form className={styles.Form} onSubmit={handleSubmit}>
        {/* ===== DATOS LEGALES ===== (solo lectura) */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>
            Datos Legales {isEmpresa ? "de la Empresa" : "de la Organización"}
          </h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>CUIL/CUIT</label>
              <NumericInput
                className={styles.Input}
                value={
                  isEmpresa
                    ? (gestionData as Empresa).cuit || ""
                    : (gestionData as Organizacion).cuit || ""
                }
                readOnly
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Razón Social</label>
              <input
                className={styles.Input}
                type="text"
                value={
                  isEmpresa
                    ? (gestionData as Empresa).razon_social || ""
                    : (gestionData as Organizacion).razon_social || ""
                }
                readOnly
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>
                {isEmpresa ? "Nombre de Empresa" : "Nombre de Organización"}
              </label>
              <input
                className={styles.Input}
                type="text"
                value={
                  isEmpresa
                    ? (gestionData as Empresa).nombre_empresa || ""
                    : (gestionData as Organizacion).nombre_organizacion || ""
                }
                readOnly
              />
            </div>
          </div>
        </section>

        {/* ===== INFORMACIÓN GENERAL ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>
            Información de {isEmpresa ? "la Empresa" : "la Organización"}
          </h2>

          {/* Descripción (editable para ambos) */}
          <div className={styles.Field} style={{ gridColumn: "span 2" }}>
            <label className={styles.Label}>Descripción</label>
            <textarea
              className={`${styles.Input} ${styles.Textarea}`}
              value={editableData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              placeholder={`Describa su ${isEmpresa ? "empresa" : "organización"}, misión, visión, valores...`}
              rows={4}
              maxLength={255}
            />
          </div>

          <div className={styles.Grid}>
            {/* Actividad */}
            {isEmpresa && (
              <div className={styles.Field}>
                <label className={styles.Label}>Actividad</label>
                <input
                  className={styles.Input}
                  type="text"
                  value={editableData.actividad || ""}
                  onChange={(e) =>
                    handleInputChange("actividad", e.target.value)
                  }
                  placeholder="Ej: Supermercado, Tecnología, etc."
                />
              </div>
            )}

            {/* Prefijo y Teléfono (para ambos) */}
            <div className={styles.Field}>
              <label className={styles.Label}>Prefijo</label>
              <NumericInput
                className={styles.Input}
                value={editableData.prefijo}
                onChange={(e) => handleInputChange("prefijo", e.target.value)}
                placeholder="11"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Teléfono</label>
              <NumericInput
                className={styles.Input}
                value={editableData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                placeholder="11 12345678"
              />
            </div>

            {/* Dirección (para ambos) */}
            <div className={styles.Field}>
              <label className={styles.Label}>Calle</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.calle}
                onChange={(e) =>
                  handleInputChange(
                    "calle",
                    onlyLettersAndSpaces(e.target.value),
                  )
                }
                placeholder="Nombre de la calle"
                maxLength={255}
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Número</label>
              <NumericInput
                className={styles.Input}
                value={editableData.numero}
                onChange={(e) => handleInputChange("numero", e.target.value)}
                placeholder="Número del domicilio"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Provincia</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.provincia}
                onChange={(e) =>
                  handleInputChange(
                    "provincia",
                    onlyLettersAndSpaces(e.target.value),
                  )
                }
                placeholder="Buenos Aires"
                maxLength={255}
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Ciudad</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.ciudad}
                onChange={(e) =>
                  handleInputChange(
                    "ciudad",
                    onlyLettersAndSpaces(e.target.value),
                  )
                }
                placeholder="Vicente López"
                maxLength={255}
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Código Postal</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.codigo_postal}
                onChange={(e) =>
                  handleInputChange(
                    "codigo_postal",
                    onlyLettersNumbers(e.target.value),
                  )
                }
                placeholder="B1638"
                maxLength={255}
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Sitio Web</label>
              <input
                className={styles.Input}
                type="url"
                value={editableData.web}
                onChange={(e) => handleInputChange("web", e.target.value)}
                placeholder={`https://www.ejemplo.${isEmpresa ? "com" : "org"}`}
                maxLength={255}
              />
            </div>

            {/* Logo (solo para empresa) */}
            {isEmpresa && (
              <div className={styles.Field}>
                <label className={styles.Label}>Logo</label>

                <div style={{ marginBottom: "10px" }}>
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Preview Logo"
                      width={200}
                      height={200}
                      style={{ objectFit: "contain", borderRadius: "8px" }}
                    />
                  ) : editableData.logo ? (
                    <Image
                      src={editableData.logo}
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

                <input
                  id="logoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />

                <button
                  type="button"
                  className={styles.UploadButton}
                  onClick={() => document.getElementById("logoUpload")?.click()}
                >
                  Agregar / Cambiar Imagen
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ===== ESTADO ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>
            Estado de {isEmpresa ? "la Empresa" : "la Organización"}
          </h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Verificada</label>
              <div className={styles.Status}>
                {(
                  isEmpresa
                    ? (gestionData as Empresa).verificada
                    : (gestionData as Organizacion).verificada
                )
                  ? "✅ Verificada"
                  : "⏳ Pendiente"}
              </div>
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Fecha de Registro</label>
              <div className={styles.Status}>
                {new Date(
                  isEmpresa
                    ? (gestionData as Empresa).fecha_registro
                    : (gestionData as Organizacion).fecha_registro,
                ).toLocaleDateString()}
              </div>
            </div>
          </div>
        </section>

        {/* Mensajes de éxito/error */}
        {success && (
          <div className={styles.SuccessMessage}>
            ¡Cambios guardados exitosamente!
          </div>
        )}
        {error && <div className={styles.ErrorMessage}>Error: {error}</div>}

        <button type="submit" className={styles.SubmitButton} disabled={saving}>
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </main>
  );
}
