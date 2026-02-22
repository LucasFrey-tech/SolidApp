"use client";

import { baseApi } from "@/API/baseApi";
import { NumericInput } from "../../Utils/NumericInputProp";
import styles from "@/styles/UserPanel/data/empresaData.module.css";
import { useCallback, useEffect, useState } from "react";
import { Empresa, EmpresaUpdateRequest } from "@/API/types/empresas";
import { useUser } from "@/app/context/UserContext";
import Image from "next/image";

type EditableEmpresaFields = Pick<
  Empresa,
  "descripcion" | "rubro" | "telefono" | "direccion" | "web" | "logo"
>;

const defaultEditableData: EditableEmpresaFields = {
  descripcion: "",
  rubro: "",
  telefono: "",
  direccion: "",
  web: "",
  logo: "",
};

export default function EmpresaData() {
  const [empresaData, setEmpresaData] = useState<Empresa>();
  const [editableData, setEditableData] =
    useState<EditableEmpresaFields>(defaultEditableData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { user } = useUser();

  useEffect(() => {
    const fetchEmpresaData = async () => {
      if (!user) return;

      setLoading(true);

      try {
        console.log("Buscando empresa con ID: ", user.sub);

        const response = await baseApi.empresa.getOne(user.sub);

        if (!response) {
          throw new Error("Error al obtener los datos de la empresa");
        }

        setEmpresaData(response);

        const { descripcion, rubro, telefono, direccion, web, logo } = response;
        setEditableData({
          descripcion: descripcion || "",
          rubro: rubro || "",
          telefono: telefono || "",
          direccion: direccion || "",
          web: web || "",
          logo: logo || "",
        });
      } catch (error) {
        console.error("Error fetching empresa data: ", error);
        setError(error instanceof Error ? error.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresaData();
  }, [user]);

  const handleInputChange = useCallback(
    (field: keyof EditableEmpresaFields, value: string) => {
      console.log(`Cambiando ${field}:`, value);
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
    if (!file) return;

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
    if (!empresaData) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const dataToSend: Partial<EditableEmpresaFields> = {};
      const campos: (keyof EditableEmpresaFields)[] = [
        "descripcion",
        "rubro",
        "telefono",
        "direccion",
        "web",
      ];

      campos.forEach((campo) => {
        const valorActual = empresaData[campo as keyof Empresa];
        const valorNuevo = editableData[campo];

        if (valorNuevo !== undefined && valorNuevo !== valorActual) {
          (dataToSend as Record<string, string>)[campo] = valorNuevo;
        }
      });

      if (Object.keys(dataToSend).length === 0 && !selectedFile) {
        setSuccess(true);
        setSaving(false);
        return;
      }

      console.log("=== DATOS ENVIADOS A LA API ===");
      console.log("ID:", empresaData.id);
      console.log("Data a enviar (JSON):", dataToSend);
      console.log("Archivo seleccionado:", selectedFile);
      console.log("Tamaño del archivo:", selectedFile?.size);
      console.log("Tipo de archivo:", selectedFile?.type);
      console.log("=================================");

      if (selectedFile) {
        await baseApi.empresa.update(
          empresaData.id,
          dataToSend as EmpresaUpdateRequest,
          selectedFile,
        );
      } else {
        await baseApi.empresa.update(
          empresaData.id,
          dataToSend as EmpresaUpdateRequest,
        );
      }
      
      setSuccess(true);

      setEmpresaData((prevData) => {
        if (!prevData) return prevData;

        const updatedData = {
          ...prevData,
          ...dataToSend,
        };

        if (selectedFile && preview) {
          updatedData.logo = preview;
        }

        return updatedData;
      });

      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Error en update empresa:", error);
      setError(
        error instanceof Error ? error.message : "Error al guardar cambios",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando datos de la empresa...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!empresaData) return <div>No se encontraron datos de la empresa</div>;

  return (
    <main className={styles.Content}>
      <form className={styles.Form} onSubmit={handleSubmit}>
        {/* ===== DATOS LEGALES ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Datos Legales</h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Número de CUIT/CUIL</label>
              <NumericInput
                className={styles.Input}
                value={empresaData.cuit_empresa || ""}
                readOnly
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Razón Social</label>
              <input
                className={styles.Input}
                type="text"
                value={empresaData.razon_social || ""}
                readOnly
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Nombre de Fantasía</label>
              <input
                className={styles.Input}
                type="text"
                value={empresaData.nombre_fantasia || ""}
                readOnly
              />
            </div>
          </div>
        </section>

        {/* ===== INFORMACIÓN DE LA EMPRESA ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Información de la Empresa</h2>

          <div className={styles.Field} style={{ gridColumn: "span 2" }}>
            <label className={styles.Label}>Descripción</label>
            <textarea
              className={`${styles.Input} ${styles.Textarea}`}
              value={editableData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              placeholder="Describa su empresa, misión, visión, valores..."
              rows={4}
            />
          </div>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Rubro</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.rubro}
                onChange={(e) => handleInputChange("rubro", e.target.value)}
                placeholder="Ej: Supermercado, Tecnología, etc."
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Teléfono</label>
              <NumericInput
                className={styles.Input}
                value={editableData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Dirección</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                placeholder="Calle y número"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Sitio Web</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.web}
                onChange={(e) => handleInputChange("web", e.target.value)}
                placeholder="https://www.ejemplo.com"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Imagen (Logo)</label>

              <div style={{ marginBottom: "10px" }}>
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview Logo"
                    width={200}
                    height={200}
                    style={{ objectFit: "contain", borderRadius: "8px" }}
                  />
                ) : empresaData.logo ? (
                  <Image
                    src={empresaData.logo}
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
          </div>
        </section>

        {/* ===== CONTACTO ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Estado de la Empresa</h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Verificada</label>
              <div className={styles.Status}>
                {empresaData.verificada ? "✅ Verificada" : "⏳ Pendiente"}
              </div>
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Fecha Registro</label>
              <div className={styles.Status}>
                {new Date(empresaData.fecha_registro).toLocaleDateString()}
              </div>
            </div>
          </div>
        </section>

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
