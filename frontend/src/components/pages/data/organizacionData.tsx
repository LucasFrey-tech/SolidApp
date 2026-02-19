"use client";

import { baseApi } from "@/API/baseApi";
import styles from '@/styles/UserPanel/data/organizacionData.module.css';
import { useCallback, useEffect, useState } from "react";
import {
  Organizacion,
  OrganizacionUpdateRequest,
} from "@/API/types/organizaciones";

type EditableOrganizacionFields = Pick<
  Organizacion,
  "descripcion" | "telefono" | "direccion" | "web"
>;

const defaultEditableData: EditableOrganizacionFields = {
  descripcion: "",
  telefono: "",
  direccion: "",
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

  useEffect(() => {
    const fetchOrganizacionData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No hay token disponible");
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Buscando organización con ID: ", payload.sub);

        // Necesitarás agregar este método en tu BaseApi
        const response = await baseApi.organizacion.getOne(payload.sub);

        if (!response) {
          throw new Error("Error al obtener los datos de la organización");
        }

        setOrganizacionData(response);

        // Extraer solo los campos editables
        const { descripcion, telefono, direccion, web } = response;
        setEditableData({
          descripcion: descripcion || "",
          telefono: telefono || "",
          direccion: direccion || "",
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
  }, []);

  const handleInputChange = useCallback(
    (field: keyof EditableOrganizacionFields, value: string) => {
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
    if (!organizacionData) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Preparar datos para enviar (solo los que cambiaron)
      const dataToSend: Partial<EditableOrganizacionFields> = {};
      const campos: (keyof EditableOrganizacionFields)[] = [
        "descripcion",
        "telefono",
        "direccion",
        "web",
      ];

      campos.forEach((campo) => {
        const valorActual = organizacionData[campo as keyof Organizacion];
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

      // Necesitarás agregar este método en tu BaseApi
      await baseApi.organizacion.update(
        organizacionData.id,
        dataToSend as OrganizacionUpdateRequest,
      );

      setSuccess(true);

      // Refrescar datos después de actualizar
      const updatedOrganizacion = await baseApi.organizacion.getOne(organizacionData.id);
      setOrganizacionData(updatedOrganizacion);

      // Actualizar editableData con los nuevos valores
      const { descripcion, telefono, direccion, web } = updatedOrganizacion;
      setEditableData({
        descripcion: descripcion || "",
        telefono: telefono || "",
        direccion: direccion || "",
        web: web || "",
      });
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
  if (!organizacionData) return <div>No se encontraron datos de la organización</div>;

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
                value={organizacionData.nroDocumento || ""}
                readOnly
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Razón Social</label>
              <input
                className={styles.Input}
                type="text"
                value={organizacionData.razonSocial || ""}
                readOnly
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Nombre</label>
              <input
                className={styles.Input}
                type="text"
                value={organizacionData.nombreFantasia || ""}
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
              <label className={styles.Label}>Dirección</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                placeholder="Calle y número"
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
                {new Date(organizacionData.fechaRegistro).toLocaleDateString()}
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

