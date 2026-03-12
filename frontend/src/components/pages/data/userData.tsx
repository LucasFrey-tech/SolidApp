"use client";

import { baseApi } from "@/API/baseApi";
import { NumericInput } from "../../Utils/NumericInputProp";
import styles from "@/styles/UserPanel/data/userData.module.css";
import { useCallback, useEffect, useState } from "react";
import { User } from "@/API/types/user";
import { useUser } from "@/app/context/UserContext";

type EditableUserFields = {
  calle: string;
  numero: string;
  adicional?: string;
  codigo_postal: string;
  provincia: string;
  ciudad: string;

  prefijo: string;
  telefono: string;
};

const defaultEditableData: EditableUserFields = {
  calle: "",
  numero: "",
  adicional: "",
  codigo_postal: "",
  provincia: "",
  ciudad: "",
  prefijo: "",
  telefono: "",
};

export default function UserData() {
  const [userData, setUserData] = useState<User>();
  const [editableData, setEditableData] =
    useState<EditableUserFields>(defaultEditableData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const response = await baseApi.usuario.getPerfil();

        if (!response) {
          throw new Error("Error al obtener los datos");
        }

        setUserData(response);

        setEditableData({
          calle: response.direccion?.calle || "",
          numero: response.direccion?.numero || "",
          adicional: response.direccion?.adicional || "",
          codigo_postal: response.direccion?.codigo_postal || "",
          provincia: response.direccion?.provincia || "",
          ciudad: response.direccion?.ciudad || "",
          prefijo: response.contacto?.prefijo || "",
          telefono: response.contacto?.telefono || "",
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = useCallback(
    (field: keyof EditableUserFields, value: string) => {
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
    if (!userData) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const dataToSend = {
        direccion: {
          calle: editableData.calle,
          numero: editableData.numero,
          adicional: editableData.adicional,
          codigo_postal: editableData.codigo_postal,
          provincia: editableData.provincia,
          ciudad: editableData.ciudad,
        },
        contacto: {
          prefijo: editableData.prefijo,
          telefono: editableData.telefono,
        },
      };

      const updated = await baseApi.usuario.updatePerfil(dataToSend);

      setUserData(updated);
      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al guardar cambios",
      );
    } finally {
      setSaving(false);
    }
  };

  const onlyLettersAndSpaces = (value: string) =>
    value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");

  if (loading) return <div>Cargando datos de usuario...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className={styles.Content}>
      <form className={styles.Form} onSubmit={handleSubmit}>
        {/* ===== DATOS PERSONALES ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Datos personales</h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Número de DNI</label>
              <NumericInput
                className={styles.Input}
                value={userData?.documento}
                readOnly
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Nombre</label>
              <input
                className={styles.Input}
                type="text"
                value={userData?.nombre}
                readOnly
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Apellido</label>
              <input
                className={styles.Input}
                type="text"
                value={userData?.apellido}
                readOnly
              />
            </div>
          </div>
        </section>

        {/* ===== DIRECCIÓN ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Información de dirección</h2>

          <div className={styles.Grid}>
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
                placeholder="Ej: Av. Siempre Viva"
                required
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Número</label>
              <NumericInput
                className={styles.Input}
                value={editableData.numero}
                onChange={(e) => handleInputChange("numero", e.target.value)}
                placeholder="123"
                required
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Adicional</label>
              <input
                className={styles.Input}
                type="text"
                value={editableData.adicional || ""}
                onChange={(e) => handleInputChange("adicional", e.target.value)}
                placeholder="Dto, Piso, etc"
                required
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Código Postal</label>
              <NumericInput
                className={styles.Input}
                value={editableData.codigo_postal}
                onChange={(e) =>
                  handleInputChange("codigo_postal", e.target.value)
                }
                placeholder="1234"
                required
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
                required
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
                placeholder="CABA"
                required
              />
            </div>
          </div>
        </section>

        {/* ===== CONTACTO ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Información de contacto</h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Prefijo</label>
              <NumericInput
                className={styles.Input}
                value={editableData.prefijo}
                maxLength={5}
                onChange={(e) => handleInputChange("prefijo", e.target.value)}
                placeholder="11"
                required
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Teléfono</label>
              <NumericInput
                className={styles.Input}
                value={editableData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                placeholder="12345678"
                required
              />
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
