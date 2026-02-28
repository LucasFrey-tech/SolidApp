"use client";

import { baseApi } from "@/API/baseApi";
import styles from "@/styles/UserPanel/data/organizacionData.module.css";
import { useCallback, useEffect, useState } from "react";
import {
  Organizacion,
  OrganizacionUpdateRequest,
} from "@/API/types/organizaciones";
import { useUser } from "@/app/context/UserContext";

type EditableOrganizacionFields = Pick<
  Organizacion,
  | "descripcion"
  | "prefijo"
  | "telefono"
  | "calle"
  | "numero"
  | "provincia"
  | "ciudad"
  | "codigo_postal"
  | "web"
>;

const defaultEditableData: EditableOrganizacionFields = {
  descripcion: "",
  prefijo: "",
  telefono: "",
  calle: "",
  numero: "",
  provincia: "",
  ciudad: "",
  codigo_postal: "",
  web: "",
};

export default function OrganizacionData() {
  const [organizacionData, setOrganizacionData] = useState<Organizacion>();
  const [editableData, setEditableData] =
    useState<EditableOrganizacionFields>(defaultEditableData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    const fetchOrganizacionData = async () => {
      if (!user) return;

      setLoading(true);

      try {
        const response = await baseApi.organizacion.getPerfil();

        if (!response) {
          throw new Error("Error al obtener los datos de la organización");
        }

        setOrganizacionData(response);

        const {
          descripcion,
          prefijo,
          telefono,
          calle,
          numero,
          provincia,
          ciudad,
          codigo_postal,
          web,
        } = response;
        setEditableData({
          descripcion: descripcion || "",
          prefijo: prefijo || "",
          telefono: telefono || "",
          calle: calle || "",
          numero: numero || "",
          provincia: provincia || "",
          ciudad: ciudad || "",
          codigo_postal: codigo_postal || "",
          web: web || "",
        });
      } catch (error) {
        console.error("Error fetching organización data: ", error);
        setError(error instanceof Error ? error.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizacionData();
  }, [user]);

  const handleInputChange = useCallback(
    (field: keyof EditableOrganizacionFields, value: string) => {
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
    if (!organizacionData) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const dataToSend: Partial<EditableOrganizacionFields> = {};
      const campos: (keyof EditableOrganizacionFields)[] = [
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

      campos.forEach((campo) => {
        const valorActual = organizacionData[campo as keyof Organizacion] ?? "";
        const valorNuevo = editableData[campo] ?? "";
        if (valorNuevo !== valorActual) {
          (dataToSend as Record<string, string>)[campo] = valorNuevo;
        }
      });

      if (Object.keys(dataToSend).length === 0) {
        setSuccess(true);
        setSaving(false);
        return;
      }

      console.log("Datos que salen del formulario: ", dataToSend);

      const updated = await baseApi.organizacion.updatePerfil(
        dataToSend as OrganizacionUpdateRequest,
      );
      setOrganizacionData(updated);
      setSuccess(true);
    } catch (error) {
      console.error("Error en update organización:", error);
      setError(
        error instanceof Error ? error.message : "Error al guardar cambios",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando datos de la organización...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!organizacionData)
    return <div>No se encontraron datos de la organización</div>;

  return (
    <main className={styles.Content}>
      <form className={styles.Form} onSubmit={handleSubmit}>
        {/* ===== DATOS DE LA ORGANIZACIÓN ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Datos de la Organización</h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>CUIL/CUIT</label>
              <input
                className={styles.Input}
                type="text"
                value={organizacionData.cuit_organizacion || ""}
                readOnly
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Razón Social</label>
              <input
                className={styles.Input}
                type="text"
                value={organizacionData.razon_social || ""}
                readOnly
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Nombre</label>
              <input
                className={styles.Input}
                type="text"
                value={organizacionData.nombre_organizacion || ""}
                readOnly
              />
            </div>
          </div>

          <div className={styles.Field} style={{ gridColumn: "span 2" }}>
            <label className={styles.Label}>Descripción</label>
            <textarea
              className={`${styles.Input} ${styles.Textarea}`}
              value={editableData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              placeholder="Describa su organización, misión, visión, valores..."
              rows={4}
              maxLength={255}
            />
          </div>
        </section>

        {/* ===== INFORMACIÓN DE CONTACTO ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Información de Contacto</h2>

          

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Prefijo</label>
              <input
                className={styles.Input}
                type="tel"
                value={editableData.prefijo}
                onChange={(e) => handleInputChange("prefijo", e.target.value)}
                placeholder="11"
                maxLength={25}
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Teléfono</label>
              <input
                className={styles.Input}
                type="tel"
                value={editableData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                placeholder="+54 11 1234-5678"
                maxLength={25}
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Calle</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.calle}
                onChange={(e) => handleInputChange("calle", e.target.value)}
                placeholder="Nombre de la calle"
                maxLength={255}
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Número</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.numero}
                onChange={(e) => handleInputChange("numero", e.target.value)}
                placeholder="Número del domicilio"
                maxLength={255}
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
                maxLength={255}
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
                maxLength={255}
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Codigo Postal</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.codigo_postal}
                onChange={(e) => handleInputChange("codigo_postal", e.target.value)}
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
                placeholder="https://www.ejemplo.org"
                maxLength={255}
              />
            </div>
          </div>
        </section>

        {/* ===== ESTADO DE LA ORGANIZACIÓN ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Estado de la Organización</h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Verificada</label>
              <div className={styles.Status}>
                {organizacionData.verificada ? "✅ Verificada" : "⏳ Pendiente"}
              </div>
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Fecha de Registro</label>
              <div className={styles.Status}>
                {new Date(organizacionData.fecha_registro).toLocaleDateString()}
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
