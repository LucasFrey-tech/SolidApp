import { useState } from "react";
import { z } from "zod";
import Image from "next/image";
import styles from "../../styles/login-registro/registro.module.css";
import { baseApi } from "@/API/baseApi";
import { NumericInput } from "../Utils/NumericInputProp";
import Swal from "sweetalert2";
import { RolCuenta } from "@/API/types/auth";

// ==================== ESQUEMAS ZOD ====================
const usuarioSchema = z
  .object({
    documento: z
      .string()
      .min(1, "El documento es obligatorio")
      .min(7, "El documento debe tener al menos 7 caracteres"),
    correo: z
      .string()
      .min(1, "El email es obligatorio")
      .email({ message: "Email inválido" }),
    clave: z
      .string()
      .min(1, "La contraseña es obligatoria")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmarClave: z.string().min(1, "Repetí la contraseña"),
    nombre: z
      .string()
      .min(1, "El nombre es obligatorio")
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: z
      .string()
      .min(1, "El apellido es obligatorio")
      .min(2, "El apellido debe tener al menos 2 caracteres"),
  })
  .refine((data) => data.clave === data.confirmarClave, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarClave"],
  });

const empresaSchema = z
  .object({
    cuit_empresa: z
      .string()
      .min(1, "El cuit es obligatorio")
      .min(3, "El cuit debe tener al menos 3 caracteres"),
    razon_social: z
      .string()
      .min(1, "La razón social es obligatoria")
      .min(3, "La razón social debe tener al menos 3 caracteres"),
    nombre_empresa: z
      .string()
      .min(1, "El nombre de fantasía es obligatorio")
      .min(3, "El nombre de fantasía debe tener al menos 3 caracteres"),
    clave: z
      .string()
      .min(1, "La contraseña es obligatoria")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmarClave: z.string().min(1, "Repetí la contraseña"),
    telefono: z
      .string()
      .min(1, "El teléfono es obligatorio")
      .min(8, "El teléfono debe tener al menos 8 caracteres"),
    calle: z
      .string()
      .min(1, "El nombre de la calle de la dirección")
      .min(3, "El nombre de la calle debe tener al menos 3"),
    numero: z
      .string()
      .min(1, "El número de la dirección")
      .min(3, "El número debe tener al menos 3"),
    correo: z
      .string()
      .min(1, "El correo es obligatorio")
      .email("El correo debe tener un formato válido"),
    web: z.string().optional(),
  })
  .refine((data) => data.clave === data.confirmarClave, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarClave"],
  });

const organizacionSchema = z
  .object({
    cuit_organizacion: z
      .string()
      .min(1, "El cuit es obligatorio")
      .min(3, "El cuit debe tener al menos 3 caracteres"),
    razon_social: z
      .string()
      .min(1, "La razón social es obligatoria")
      .min(3, "La razón social debe tener al menos 3 caracteres"),
    nombre_organizacion: z
      .string()
      .min(1, "El nombre es obligatorio")
      .min(3, "El nombre debe tener al menos 3 caracteres"),
    clave: z
      .string()
      .min(1, "La contraseña es obligatoria")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmarClave: z.string().min(1, "Repetí la contraseña"),
    correo: z
      .string()
      .min(1, "El correo es obligatorio")
      .email("El correo debe tener un formato válido"),
  })
  .refine((data) => data.clave === data.confirmarClave, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarClave"],
  });

// ==================== TIPOS ====================
type FormType = "usuario" | "empresa" | "organizacion";

type UsuarioData = z.infer<typeof usuarioSchema>;
type EmpresaData = z.infer<typeof empresaSchema>;
type OrganizacionData = z.infer<typeof organizacionSchema>;

type Step = "select" | FormType;

type Errors = Record<string, string | undefined>;
type Touched = Record<string, boolean>;

const numericFields = ["documento", "telefono"];

// ==================== CONFIGURACIÓN DE CAMPOS ====================
type FieldConfig = {
  field: string;
  label: string;
  type: string;
  placeholder: string;
  optional?: boolean;
};

const fieldConfigs: Record<FormType, FieldConfig[]> = {
  usuario: [
    { field: "documento", label: "Documento", type: "text", placeholder: "DNI" },
    { field: "correo", label: "Correo electrónico", type: "email", placeholder: "ejemplo@email.com" },
    { field: "clave", label: "Contraseña", type: "password", placeholder: "••••••••" },
    { field: "confirmarClave", label: "Repetir contraseña", type: "password", placeholder: "••••••••" },
    { field: "nombre", label: "Nombre", type: "text", placeholder: "Tu nombre" },
    { field: "apellido", label: "Apellido", type: "text", placeholder: "Tu apellido" },
  ],
  empresa: [
     { field: "cuit_empresa", label: "Número de CUIT", type: "text", placeholder: "Ej: 30-12345678-9" },
    { field: "razon_social", label: "Razón Social", type: "text", placeholder: "Nombre legal" },
    { field: "nombre_empresa", label: "Nombre de Fantasía", type: "text", placeholder: "Nombre comercial" },
    { field: "correo", label: "Correo electrónico", type: "email", placeholder: "ejemplo@empresa.com" },
    { field: "clave", label: "Contraseña", type: "password", placeholder: "••••••••" },
    { field: "confirmarClave", label: "Repetir contraseña", type: "password", placeholder: "••••••••" },
    { field: "telefono", label: "Teléfono", type: "text", placeholder: "+54 11 1234-5678" },
    { field: "calle", label: "Calle", type: "text", placeholder: "Av. Siempre Viva" },
    { field: "numero", label: "Número", type: "text", placeholder: "742" },
    { field: "web", label: "Web", type: "text", placeholder: "https://...", optional: true },
  ],
  organizacion: [
    { field: "cuit_organizacion", label: "Número de CUIT", type: "text", placeholder: "12345" },
    { field: "razon_social", label: "Razón Social", type: "text", placeholder: "Nombre legal" },
    { field: "nombre_organizacion", label: "Nombre", type: "text", placeholder: "Nombre de uso común" },
    { field: "correo", label: "Correo electrónico", type: "email", placeholder: "ejemplo@organizacion.com" },
    { field: "clave", label: "Contraseña", type: "password", placeholder: "••••••••" },
    { field: "confirmarClave", label: "Repetir contraseña", type: "password", placeholder: "••••••••" },
  ],
};

// ==================== ESTADO INICIAL ====================
const initialUsuarioData: UsuarioData = {
  documento: "",
  correo: "",
  clave: "",
  confirmarClave: "",
  nombre: "",
  apellido: "",
};

const initialEmpresaData: EmpresaData = {
  cuit_empresa: "",
  razon_social: "",
  nombre_empresa: "",
  clave: "",
  confirmarClave: "",
  telefono: "",
  calle: "",
  numero: "",
  web: "",
  correo: "",
};

const initialOrganizacionData: OrganizacionData = {
  cuit_organizacion: "",
  razon_social: "",
  nombre_organizacion: "",
  clave: "",
  confirmarClave: "",
  correo: "",
};

// ==================== COMPONENTE ====================
export default function Registro() {
  const [step, setStep] = useState<Step>("select");

  const [usuarioData, setUsuarioData] = useState<UsuarioData>(initialUsuarioData);
  const [empresaData, setEmpresaData] = useState<EmpresaData>(initialEmpresaData);
  const [organizacionData, setOrganizacionData] = useState<OrganizacionData>(initialOrganizacionData);

  const [errors, setErrors] = useState<Errors>({});
  const [touchedFields, setTouchedFields] = useState<Touched>({});

  // ==================== MAPEO SIMPLE ====================
  const getCurrentData = () => {
    switch (step) {
      case "usuario": return usuarioData;
      case "empresa": return empresaData;
      case "organizacion": return organizacionData;
      default: return null;
    }
  };

  const getCurrentSchema = () => {
    switch (step) {
      case "usuario": return usuarioSchema;
      case "empresa": return empresaSchema;
      case "organizacion": return organizacionSchema;
      default: return null;
    }
  };

  // ==================== VALIDACIÓN ====================
  const validateField = (field: string, value: string, isBlur = false): string | null => {
    if (!isBlur && !touchedFields[field]) return null;

    const schema = getCurrentSchema();
    if (!schema) return null;

    const fieldSchema = (schema.shape as Record<string, z.ZodTypeAny>)[field];
    if (!fieldSchema) return null;

    try {
      fieldSchema.parse(value);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message ?? "Error de Validación";
      }
      return "Error de Validación";
    }
  };

  const validateAllFields = () => {
    if (step === "select") return { isValid: false, errors: {} as Errors };

    const schema = getCurrentSchema();
    const data = getCurrentData();

    if (!schema || !data) return { isValid: false, errors: {} as Errors };

    try {
      schema.parse(data);
      return { isValid: true, errors: {} as Errors };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Errors = {};
        for (const issue of error.issues) {
          newErrors[issue.path[0] as string] = issue.message;
        }
        return { isValid: false, errors: newErrors };
      }
      return { isValid: false, errors: {} };
    }
  };

  const isFormValid = () => validateAllFields().isValid;

  // ==================== EVENTOS ====================
  const handleChange = (field: string, value: string) => {
    if (step === "select") return;

    const sanitized = ["correo", "clave", "confirmarClave"].includes(field)
    ? value.trim()
    : value;

    switch (step) {
      case "usuario": setUsuarioData((prev) => ({ ...prev, [field]: sanitized })); break;
      case "empresa": setEmpresaData((prev) => ({ ...prev, [field]: sanitized })); break;
      case "organizacion": setOrganizacionData((prev) => ({ ...prev, [field]: sanitized })); break;
    }

    if (touchedFields[field]) {
      const error = validateField(field, value, false);
      setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    }
  };

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    const data = getCurrentData();
    if (!data) return;

    const value = (data as Record<string, string>)[field] || "";
    const error = validateField(field, value, true);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const resetForms = () => {
    setUsuarioData(initialUsuarioData);
    setEmpresaData(initialEmpresaData);
    setOrganizacionData(initialOrganizacionData);
    setErrors({});
    setTouchedFields({});
    setStep("select");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "select") return;

    const validation = validateAllFields();
    if (!validation.isValid) {
      setErrors(validation.errors);
      const allFields: Touched = {};
      const data = getCurrentData();
      if (data) Object.keys(data).forEach((k) => (allFields[k] = true));
      setTouchedFields(allFields);
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos requeridos.",
        confirmButtonColor: "#9fd46d",
      });
      return;
    }

    try {
      switch (step) {
        case "usuario": {
          const { confirmarClave, correo, clave,...perfilUsuario } = usuarioData;
          await baseApi.register.register({
            correo: correo,
            clave: clave,
            role: RolCuenta.USUARIO,
            perfilUsuario,
          });
          break;
        }
        case "empresa": {
          const { confirmarClave, correo, clave, ...perfilEmpresa } = empresaData;
          await baseApi.register.register({
            correo: correo,
            clave: clave,
            role: RolCuenta.EMPRESA,
            perfilEmpresa,
          });
          break;
        }
        case "organizacion": {
          const { confirmarClave, correo, clave,...perfilOrganizacion } = organizacionData;
          await baseApi.register.register({
            correo: correo,
            clave: clave,
            role: RolCuenta.ORGANIZACION,
            perfilOrganizacion,
          });
          break;
        }
      }

      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Tu cuenta fue creada correctamente",
        confirmButtonColor: "#9fd46d",
      });

      resetForms();
    } catch (error: any) {
      console.error("Error al Registrar:", error);

      let errorMessage = "No se pudo registrar el usuario";
      if (error?.message) errorMessage = error.message;

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleStepChange = (newStep: Step) => {
    setStep(newStep);
    setErrors({});
    setTouchedFields({});
  };

  const getInputClass = (field: string) => {
    const showError = touchedFields[field] && errors[field];
    return `${styles.input} ${showError ? styles.inputError : ""}`;
  };

  // ==================== RENDER DE CAMPOS ====================
  const renderField = (
    field: string,
    label: string,
    type = "text",
    placeholder: string,
    options: { optional?: boolean } = {},
    key: string,
  ) => {
    const optional = options.optional ?? false;
    const showError = touchedFields[field] && errors[field];
    const data = getCurrentData();
    const value = data ? (data as Record<string, string>)[field] || "" : "";
    const isNumeric = numericFields.includes(field);

    return (
      <div key={key} className={styles.fieldGroup}>
        <label className={`${styles.label} ${optional ? styles.optional : ""}`}>
          {label} {!optional && "*"}
        </label>

        {isNumeric ? (
          <NumericInput
            className={getInputClass(field)}
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
          />
        ) : (
          <input
            className={getInputClass(field)}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
          />
        )}

        {showError && <span className={styles.errorText}>{errors[field]}</span>}
      </div>
    );
  };

  // ==================== RENDER DINÁMICO DE FORMULARIOS ====================
  const renderForm = (formType: FormType) => {
    const configs = fieldConfigs[formType];

    return (
      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <button
              className={styles.backButton}
              type="button"
              onClick={() => handleStepChange("select")}
            >
              ← Volver
            </button>
            <h2 className={styles.title}>
              Registro {formType.charAt(0).toUpperCase() + formType.slice(1)}
            </h2>
          </div>

          <div className={styles.scrollableFields}>
            {configs.map(({ field, label, type, placeholder, optional }, index) =>
              renderField(field, label, type, placeholder, { optional }, `${formType}-${field}-${index}`),
            )}
          </div>

          <button disabled={!isFormValid()} className={styles.btn} type="submit">
            {formType === "usuario" ? "Crear cuenta" : `Registrar ${formType}`}
          </button>
          <p className={styles.requiredHint}>* Campos obligatorios</p>
        </form>
      </div>
    );
  };

  // ==================== JSX ====================
  return (
    <div className={styles.registroContainer}>
      {step === "select" && (
        <>
          <h2 className={styles.title}>Elige tu tipo de registro</h2>

          <div className={styles.cards}>
            <div className={styles.card} onClick={() => handleStepChange("usuario")}>
              <Image src="/Registro/Donador_Registro.svg" alt="Usuario" width={80} height={80} />
              <p className={styles.cardText}>Usuario</p>
            </div>

            <div className={styles.card} onClick={() => handleStepChange("empresa")}>
              <Image src="/Registro/Empresa_Registro.svg" alt="Empresa" width={80} height={80} />
              <p className={styles.cardText}>Empresa</p>
            </div>

            <div className={styles.card} onClick={() => handleStepChange("organizacion")}>
              <Image src="/Registro/Organizacion_Registro.svg" alt="Organización" width={80} height={80} />
              <p className={styles.cardText}>Organización</p>
            </div>
          </div>

          <p className={styles.hint}>Haz clic en una opción para continuar</p>
        </>
      )}

      {step !== "select" && renderForm(step)}
    </div>
  );
}
