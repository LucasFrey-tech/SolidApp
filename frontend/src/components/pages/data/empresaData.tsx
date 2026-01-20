"use client";

import { BaseApi } from "@/API/baseApi";
import { NumericInput } from "../../Utils/NumericInputProp";
import styles from "@/styles/data/empresaData.module.css";
import { useCallback, useEffect, useState } from "react";
import { Empresa, EmpresaUpdateRequest } from "@/API/types/empresas";

type EditableEmpresaFields = Pick<
  Empresa,
  "descripcion" | "rubro" | "telefono" | "direccion" | "web"
>;

const defaultEditableData: EditableEmpresaFields = {
  descripcion: "",
  rubro: "",
  telefono: "",
  direccion: "",
  web: "",
};

export default function EmpresaData() {
  const [empresaData, setEmpresaData] = useState<Empresa>();
  const [editableData, setEditableData] =
    useState<EditableEmpresaFields>(defaultEditableData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const api = new BaseApi();
    const fetchEmpresaData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No hay token disponible");
        }

        const payload = JSON.parse(atob(token.split(".")[1]));

        console.log("Buscando empresa con ID: ", payload.sub);

        const response = await api.empresa.getOne(payload.sub);

        if (!response) {
          throw new Error("Error al obtener los datos de la empresa");
        }

        setEmpresaData(response);

        const { descripcion, rubro, telefono, direccion, web } = response;
        setEditableData({
          descripcion: descripcion || "",
          rubro: rubro || "",
          telefono: telefono || "",
          direccion: direccion || "",
          web: web || "",
        });
      } catch (error) {
        console.error("Error fetching empresa data: ", error);
        setError(error instanceof Error ? error.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresaData();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaData) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const api = new BaseApi();

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

      console.log("Datos a enviar (solo cambios):", dataToSend);

      if (Object.keys(dataToSend).length === 0) {
        setSuccess(true);
        setSaving(false);
        return;
      }

      await api.empresa.update(
        empresaData.id,
        dataToSend as EmpresaUpdateRequest,
      );

      setSuccess(true);

      const updatedEmpresa = await api.empresa.getOne(empresaData.id);
      setEmpresaData(updatedEmpresa);

      const { descripcion, rubro, telefono, direccion, web } = updatedEmpresa;
      setEditableData({
        descripcion: descripcion || "",
        rubro: rubro || "",
        telefono: telefono || "",
        direccion: direccion || "",
        web: web || "",
      });
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
                value={empresaData.nroDocumento || ""}
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
