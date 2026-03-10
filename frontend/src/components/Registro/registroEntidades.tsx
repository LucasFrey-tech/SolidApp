"use client";

import { useState } from "react";
import { z } from "zod";
import Image from "next/image";
import styles from "../../styles/login-registro/registro.module.css";
import { baseApi } from "@/API/baseApi";
import { NumericInput } from "../Utils/NumericInputProp";
import Swal from "sweetalert2";
import { Rol } from "@/API/types/auth";

/* ==================== ESQUEMAS ==================== */

const empresaSchema = z
  .object({
    cuit: z.string().min(3, "CUIT inválido"),
    razon_social: z.string().min(3, "Razón social inválida"),
    nombre_empresa: z.string().min(3, "Nombre de fantasía inválido"),
    correo: z.string().email("Email inválido"),
    clave: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmarClave: z.string(),
    telefono: z.string().min(8, "Teléfono inválido"),
    calle: z.string().min(3, "Calle inválida"),
    numero: z.string().min(1, "Número inválido"),
    web: z.string().optional(),
  })
  .refine((data) => data.clave === data.confirmarClave, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarClave"],
  });

const organizacionSchema = z
  .object({
    cuit: z.string().min(3, "CUIT inválido"),
    razon_social: z.string().min(3, "Razón social inválida"),
    nombre_organizacion: z.string().min(3, "Nombre inválido"),
    correo: z.string().email("Email inválido"),
    clave: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmarClave: z.string(),
  })
  .refine((data) => data.clave === data.confirmarClave, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarClave"],
  });

/* ==================== TIPOS ==================== */

type FormType = "empresa" | "organizacion";
type Step = "select" | FormType;

type EmpresaData = z.infer<typeof empresaSchema>;
type OrganizacionData = z.infer<typeof organizacionSchema>;

type Errors = Record<string, string | undefined>;
type Touched = Record<string, boolean>;

const numericFields = ["cuit_empresa", "cuit_organizacion", "telefono", "numero"];

/* ==================== CONFIG CAMPOS ==================== */

type FieldConfig = {
  field: string;
  label: string;
  type: string;
  placeholder: string;
  optional?: boolean;
};

const fieldConfigs: Record<FormType, FieldConfig[]> = {
  empresa: [
    { field: "cuit", label: "CUIT", type: "text", placeholder: "30-12345678-9" },
    { field: "razon_social", label: "Razón social", type: "text", placeholder: "Empresa SA" },
    { field: "nombre_empresa", label: "Nombre de fantasía", type: "text", placeholder: "Nombre comercial" },
    { field: "correo", label: "Correo", type: "email", placeholder: "empresa@email.com" },
    { field: "clave", label: "Contraseña", type: "password", placeholder: "••••••••" },
    { field: "confirmarClave", label: "Repetir contraseña", type: "password", placeholder: "••••••••" },
    { field: "telefono", label: "Teléfono", type: "text", placeholder: "+54 11 1234 5678" },
    { field: "calle", label: "Calle", type: "text", placeholder: "Av. Siempre Viva" },
    { field: "numero", label: "Número", type: "text", placeholder: "742" },
    { field: "web", label: "Web", type: "text", placeholder: "https://...", optional: true },
  ],

  organizacion: [
    { field: "cuit", label: "CUIT", type: "text", placeholder: "12345" },
    { field: "razon_social", label: "Razón social", type: "text", placeholder: "Fundación..." },
    { field: "nombre_organizacion", label: "Nombre", type: "text", placeholder: "Nombre público" },
    { field: "correo", label: "Correo", type: "email", placeholder: "organizacion@email.com" },
    { field: "clave", label: "Contraseña", type: "password", placeholder: "••••••••" },
    { field: "confirmarClave", label: "Repetir contraseña", type: "password", placeholder: "••••••••" },
  ],
};

/* ==================== ESTADO INICIAL ==================== */

const initialEmpresaData: EmpresaData = {
  cuit: "",
  razon_social: "",
  nombre_empresa: "",
  correo: "",
  clave: "",
  confirmarClave: "",
  telefono: "",
  calle: "",
  numero: "",
  web: "",
};

const initialOrganizacionData: OrganizacionData = {
  cuit: "",
  razon_social: "",
  nombre_organizacion: "",
  correo: "",
  clave: "",
  confirmarClave: "",
};

/* ==================== COMPONENTE ==================== */

export default function RegistroEntidades() {
  const [step, setStep] = useState<Step>("select");

  const [empresaData, setEmpresaData] = useState(initialEmpresaData);
  const [organizacionData, setOrganizacionData] = useState(initialOrganizacionData);

  const [errors, setErrors] = useState<Errors>({});
  const [touchedFields, setTouchedFields] = useState<Touched>({});

  const getCurrentData = () => {
    if (step === "empresa") return empresaData;
    if (step === "organizacion") return organizacionData;
    return null;
  };

  const getCurrentSchema = () => {
    if (step === "empresa") return empresaSchema;
    if (step === "organizacion") return organizacionSchema;
    return null;
  };

  const validateAllFields = () => {
    const schema = getCurrentSchema();
    const data = getCurrentData();

    if (!schema || !data) return { isValid: false, errors: {} };

    try {
      schema.parse(data);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Errors = {};
        error.issues.forEach((issue) => {
          newErrors[issue.path[0] as string] = issue.message;
        });
        return { isValid: false, errors: newErrors };
      }
      return { isValid: false, errors: {} };
    }
  };

  const handleChange = (field: string, value: string) => {
    if (step === "empresa") {
      setEmpresaData((prev) => ({ ...prev, [field]: value }));
    }

    if (step === "organizacion") {
      setOrganizacionData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateAllFields();

    if (!validation.isValid) {
      setErrors(validation.errors);
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Completa todos los campos",
      });
      return;
    }

    try {
      if (step === "empresa") {
        const { confirmarClave, correo, clave, ...perfilEmpresa } = empresaData;

        await baseApi.register.register({
          correo,
          clave,
          rol: Rol.EMPRESA,
          perfilEmpresa,
        });
      }

      if (step === "organizacion") {
        const { confirmarClave, correo, clave, ...perfilOrganizacion } =
          organizacionData;

        await baseApi.register.register({
          correo,
          clave,
          rol: Rol.ORGANIZACION,
          perfilOrganizacion,
        });
      }

      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
      });

      setStep("select");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Error al registrar",
      });
    }
  };

  const renderField = (
    field: string,
    label: string,
    type: string,
    placeholder: string,
    optional?: boolean
  ) => {
    const data = getCurrentData();
    const value = data ? (data as any)[field] || "" : "";
    const isNumeric = numericFields.includes(field);

    return (
      <div key={field} className={styles.fieldGroup}>
        <label className={styles.label}>
          {label} {!optional && "*"}
        </label>

        {isNumeric ? (
          <NumericInput
            className={styles.input}
            value={value}
            placeholder={placeholder}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        ) : (
          <input
            className={styles.input}
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        )}

        {errors[field] && (
          <span className={styles.errorText}>{errors[field]}</span>
        )}
      </div>
    );
  };

  const renderForm = (formType: FormType) => {
    const configs = fieldConfigs[formType];

    return (
      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <button
            className={styles.backButton}
            type="button"
            onClick={() => setStep("select")}
          >
            Volver
          </button>

          <h2 className={styles.title}>
            Registro {formType === "empresa" ? "Empresa" : "Organización"}
          </h2>

          <div className={styles.scrollableFields}>
            {configs.map((config) =>
              renderField(
                config.field,
                config.label,
                config.type,
                config.placeholder,
                config.optional
              )
            )}
          </div>

          <button className={styles.btn} type="submit">
            Registrar
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className={styles.registroContainer}>
      {step === "select" && (
        <>
          <h2 className={styles.title}>Seleccionar el tipo de registro</h2>

          <div className={styles.cards}>
            <div
              className={styles.card}
              onClick={() => setStep("empresa")}
            >
              <Image
                src="/Registro/Empresa_Registro.svg"
                alt="Empresa"
                width={80}
                height={80}
              />
              <p className={styles.cardText}>Empresa</p>
            </div>

            <div
              className={styles.card}
              onClick={() => setStep("organizacion")}
            >
              <Image
                src="/Registro/Organizacion_Registro.svg"
                alt="Organización"
                width={80}
                height={80}
              />
              <p className={styles.cardText}>Organización</p>
            </div>
          </div>
        </>
      )}

      {step !== "select" && renderForm(step)}
    </div>
  );
}