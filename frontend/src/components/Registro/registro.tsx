import { useState } from "react";
import { z } from "zod";
import Image from "next/image";
import styles from "../../styles/registro.module.css";
import { BaseApi } from "@/API/baseApi";

// ==================== Estrategias =====================
import { RegisterUsuarioStrategy } from "@/API/class/register/usuario";
import { RegisterEmpresaStrategy } from "@/API/class/register/empresa";
import { RegisterOrganizacionStrategy } from "@/API/class/register/organizacion";

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
    documento: z
      .string()
      .min(1, "El documento es obligatorio")
      .min(3, "El documento debe tener al menos 3 caracteres"),
    razonSocial: z
      .string()
      .min(1, "La razón social es obligatoria")
      .min(3, "La razón social debe tener al menos 3 caracteres"),
    nombreFantasia: z
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
    direccion: z
      .string()
      .min(1, "La dirección es obligatoria")
      .min(5, "La dirección debe tener al menos 5 caracteres"),
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
    documento: z
      .string()
      .min(1, "El documento es obligatorio")
      .min(3, "El documento debe tener al menos 3 caracteres"),
    razonSocial: z
      .string()
      .min(1, "La razón social es obligatoria")
      .min(3, "La razón social debe tener al menos 3 caracteres"),
    nombreFantasia: z
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
    {
      field: "documento",
      label: "Documento",
      type: "text",
      placeholder: "DNI",
    },
    {
      field: "correo",
      label: "Correo electrónico",
      type: "email",
      placeholder: "ejemplo@email.com",
    },
    {
      field: "clave",
      label: "Contraseña",
      type: "password",
      placeholder: "••••••••",
    },
    {
      field: "confirmarClave",
      label: "Repetir contraseña",
      type: "password",
      placeholder: "••••••••",
    },
    {
      field: "nombre",
      label: "Nombre",
      type: "text",
      placeholder: "Tu nombre",
    },
    {
      field: "apellido",
      label: "Apellido",
      type: "text",
      placeholder: "Tu apellido",
    },
  ],
  empresa: [
    {
      field: "documento",
      label: "Número de documento",
      type: "text",
      placeholder: "Ej: 30-12345678-9",
    },
    {
      field: "razonSocial",
      label: "Razón Social",
      type: "text",
      placeholder: "Nombre legal",
    },
    {
      field: "nombreFantasia",
      label: "Nombre Fantasía",
      type: "text",
      placeholder: "Nombre comercial",
    },
    {
      field: "clave",
      label: "Contraseña",
      type: "password",
      placeholder: "••••••••",
    },
    {
      field: "confirmarClave",
      label: "Repetir contraseña",
      type: "password",
      placeholder: "••••••••",
    },
    {
      field: "telefono",
      label: "Teléfono",
      type: "text",
      placeholder: "+54 11 1234-5678",
    },
    {
      field: "direccion",
      label: "Dirección",
      type: "text",
      placeholder: "Calle y número",
    },
    {
      field: "correo",
      label: "Correo electrónico",
      type: "email",
      placeholder: "ejemplo@empresa.com",
    },
    {
      field: "web",
      label: "Web",
      type: "text",
      placeholder: "https://...",
      optional: true,
    },
  ],
  organizacion: [
    {
      field: "documento",
      label: "Número de documento",
      type: "text",
      placeholder: "12345",
    },
    {
      field: "razonSocial",
      label: "Razón Social",
      type: "text",
      placeholder: "Nombre legal",
    },
    {
      field: "nombreFantasia",
      label: "Nombre",
      type: "text",
      placeholder: "Nombre de uso común",
    },
    {
      field: "clave",
      label: "Contraseña",
      type: "password",
      placeholder: "••••••••",
    },
    {
      field: "confirmarClave",
      label: "Repetir contraseña",
      type: "password",
      placeholder: "••••••••",
    },
    {
      field: "correo",
      label: "Correo electrónico",
      type: "email",
      placeholder: "ejemplo@organizacion.com",
    },
  ],
};

// ==================== COMPONENTE ====================
export default function Registro() {
  const [step, setStep] = useState<Step>("select");
  const [api] = useState(() => new BaseApi());

  // ==================== ESTADOS INDEPENDIENTES ====================
  const [usuarioData, setUsuarioData] = useState<UsuarioData>({
    documento: "",
    correo: "",
    clave: "",
    confirmarClave: "",
    nombre: "",
    apellido: "",
  });

  const [empresaData, setEmpresaData] = useState<EmpresaData>({
    documento: "",
    razonSocial: "",
    nombreFantasia: "",
    clave: "",
    confirmarClave: "",
    telefono: "",
    direccion: "",
    web: "",
    correo: "",
  });

  const [organizacionData, setOrganizacionData] = useState<OrganizacionData>({
    documento: "",
    razonSocial: "",
    nombreFantasia: "",
    clave: "",
    confirmarClave: "",
    correo: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touchedFields, setTouchedFields] = useState<Touched>({});

  // ==================== MAPEO SIMPLE ====================
  const getCurrentData = () => {
    switch (step) {
      case "usuario":
        return usuarioData;
      case "empresa":
        return empresaData;
      case "organizacion":
        return organizacionData;
      default:
        return null;
    }
  };

  const getCurrentSchema = () => {
    switch (step) {
      case "usuario":
        return usuarioSchema;
      case "empresa":
        return empresaSchema;
      case "organizacion":
        return organizacionSchema;
      default:
        return null;
    }
  };

  const getCurrentStrategy = () => {
    switch (step) {
      case "usuario":
        return new RegisterUsuarioStrategy(api.register);
      case "empresa":
        return new RegisterEmpresaStrategy(api.register);
      case "organizacion":
        return new RegisterOrganizacionStrategy(api.register);
      default:
        return null;
    }
  };

  // ==================== VALIDACIÓN ====================
  const validateField = (
    field: string,
    value: string,
    isBlur = false,
  ): string | null => {
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
    if (step === "select") {
      return { isValid: false, errors: {} as Errors };
    }

    const schema = getCurrentSchema();
    const data = getCurrentData();

    if (!schema || !data) {
      return { isValid: false, errors: {} as Errors };
    }

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

    // Actualizar el estado correspondiente
    switch (step) {
      case "usuario":
        setUsuarioData((prev) => ({ ...prev, [field]: value }));
        break;
      case "empresa":
        setEmpresaData((prev) => ({ ...prev, [field]: value }));
        break;
      case "organizacion":
        setOrganizacionData((prev) => ({ ...prev, [field]: value }));
        break;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === "select") return;

    const validation = validateAllFields();
    if (!validation.isValid) {
      setErrors(validation.errors);

      const allFields: Touched = {};
      const data = getCurrentData();
      if (data) {
        Object.keys(data).forEach((k) => (allFields[k] = true));
      }

      setTouchedFields(allFields);
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    console.log("Datos válidos:", {
      usuario: usuarioData,
      empresa: empresaData,
      organizacion: organizacionData,
    });

    try {
      const strategy = getCurrentStrategy();
      const data = getCurrentData();

      if (!strategy || !data) {
        throw new Error("Formulario no válido");
      }

      // Type-safe casting basado en el tipo actual
      let response;
      switch (step) {
        case "usuario": {
          const { confirmarClave, ...dataToSend } = data as UsuarioData;
          response = await (strategy as RegisterUsuarioStrategy).register(
            dataToSend as UsuarioData,
          );
          break;
        }
        case "empresa": {
          const { confirmarClave, ...dataToSend } = data as EmpresaData;
          response = await (strategy as RegisterEmpresaStrategy).register(
            dataToSend as EmpresaData,
          );
          break;
        }
        case "organizacion": {
          const { confirmarClave, ...dataToSend } = data as OrganizacionData;
          response = await (strategy as RegisterOrganizacionStrategy).register(
            dataToSend as OrganizacionData,
          );
          break;
        }
        default:
          throw new Error("Tipo de formulario no soportado");
      }

      console.log("Registro Exitoso: ", response);
      alert("Registro Exitoso");

      // Reset
      setStep("select");
      setErrors({});
      setTouchedFields({});

      // Resetear cada formulario
      setUsuarioData({
        documento: "",
        correo: "",
        clave: "",
        confirmarClave: "",
        nombre: "",
        apellido: "",
      });
      setEmpresaData({
        documento: "",
        razonSocial: "",
        nombreFantasia: "",
        clave: "",
        confirmarClave: "",
        telefono: "",
        direccion: "",
        web: "",
        correo: "",
      });
      setOrganizacionData({
        documento: "",
        razonSocial: "",
        nombreFantasia: "",
        clave: "",
        confirmarClave: "",
        correo: "",
      });
    } catch (error) {
      console.error("Error al Registrar:", error);
      alert("Error al registrar usuario");
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
    key: string, // ← Agregar parámetro key
  ) => {
    const optional = options.optional ?? false;
    const showError = touchedFields[field] && errors[field];

    const data = getCurrentData();
    const value = data ? (data as Record<string, string>)[field] || "" : "";

    return (
      <div key={key} className={styles.fieldGroup}>
        {" "}
        {/* ← Agregar key aquí */}
        <label className={`${styles.label} ${optional ? styles.optional : ""}`}>
          {label} {!optional && "*"}
        </label>
        <input
          className={getInputClass(field)}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={() => handleBlur(field)}
        />
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
            {configs.map(
              ({ field, label, type, placeholder, optional }, index) =>
                renderField(
                  field,
                  label,
                  type,
                  placeholder,
                  { optional },
                  `${formType}-${field}-${index}`, // ← Pasar key única
                ),
            )}
          </div>

          <button
            disabled={!isFormValid()}
            className={styles.btn}
            type="submit"
          >
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
            {/* USUARIO */}
            <div
              className={styles.card}
              onClick={() => handleStepChange("usuario")}
            >
              <Image
                src="/Registro/Donador_Registro.svg" // ← Verifica el nombre real
                alt="Usuario"
                width={80}
                height={80}
              />
              <p className={styles.cardText}>Usuario</p>
            </div>

            {/* EMPRESA */}
            <div
              className={styles.card}
              onClick={() => handleStepChange("empresa")}
            >
              <Image
                src="/Registro/Empresa_Registro.svg" // ← Verifica el nombre real
                alt="Empresa"
                width={80}
                height={80}
              />
              <p className={styles.cardText}>Empresa</p>
            </div>

            {/* ORGANIZACION */}
            <div
              className={styles.card}
              onClick={() => handleStepChange("organizacion")}
            >
              <Image
                src="/Registro/Organizacion_Registro.svg" // ← Verifica el nombre real
                alt="Organización"
                width={80}
                height={80}
              />
              <p className={styles.cardText}>Organización</p>
            </div>
          </div>

          <p className={styles.hint}>Haz clic en una opción para continuar</p>
        </>
      )}

      {/* === FORMULARIOS DINÁMICOS === */}
      {step !== "select" && renderForm(step)}
    </div>
  );
}
