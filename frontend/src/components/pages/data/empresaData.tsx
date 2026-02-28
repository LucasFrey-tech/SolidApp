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
  | "descripcion"
  | "rubro"
  | "prefijo"
  | "telefono"
  | "calle"
  | "numero"
  | "provincia"
  | "ciudad"
  | "codigo_postal"
  | "web"
  | "logo"
>;

const defaultEditableData: EditableEmpresaFields = {
  descripcion: "",
  rubro: "",
  prefijo: "",
  telefono: "",
  calle: "",
  numero: "",
  provincia: "",
  ciudad: "",
  codigo_postal: "",
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

        const response = await baseApi.empresa.getPerfil();

        if (!response) {
          throw new Error("Error al obtener los datos de la empresa");
        }

        setEmpresaData(response);

        const {
          descripcion,
          rubro,
          prefijo,
          telefono,
          calle,
          numero,
          provincia,
          ciudad,
          codigo_postal,
          web,
          logo,
        } = response;
        setEditableData({
          descripcion: descripcion || "",
          rubro: rubro || "",
          prefijo: prefijo || "",
          telefono: telefono || "",
          calle: calle || "",
          numero: numero || "",
          provincia: provincia || "",
          ciudad: ciudad || "",
          codigo_postal: codigo_postal || "",
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
        "prefijo",
        "telefono",
        "calle",
        "numero",
        "provincia",
        "ciudad",
        "codigo_postal",
        "web",
      ];

      campos.forEach((campo) => {
        const valorActual = empresaData[campo as keyof Empresa] ?? "";
        const valorNuevo = editableData[campo] ?? "";

        if (valorNuevo !== valorActual) {
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

      if (Object.keys(dataToSend).length === 0 && !selectedFile) {
        setSuccess(true);
        setSaving(false);
        return;
      }

      const updated = await baseApi.empresa.updatePerfil(
        dataToSend as EmpresaUpdateRequest,
        selectedFile,
      );

      setEmpresaData(updated);
      setSelectedFile(null);
      setPreview(null);
      setSuccess(true);
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
              <label className={styles.Label}>Nombre de Empresa</label>
              <input
                className={styles.Input}
                type="text"
                value={empresaData.nombre_empresa || ""}
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

            <div className={styles.Field}>
              <label className={styles.Label}>Calle</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.calle}
                onChange={(e) => handleInputChange("calle", e.target.value)}
                placeholder="El nombre de la calle"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Número</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.numero}
                onChange={(e) => handleInputChange("numero", e.target.value)}
                placeholder="El número del domicilio"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Provincia</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.provincia}
                onChange={(e) => handleInputChange("provincia", e.target.value)}
                placeholder="Buenos Aires"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Ciudad</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.ciudad}
                onChange={(e) => handleInputChange("ciudad", e.target.value)}
                placeholder="Vicente López"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Código Postal</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.codigo_postal}
                onChange={(e) =>
                  handleInputChange("codigo_postal", e.target.value)
                }
                placeholder="B1638"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Sitio Web</label>
              <input
                className={styles.Input}
                type="url"
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
