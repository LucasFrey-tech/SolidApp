import { useState } from "react";
import { z } from "zod";
import Image from "next/image";
import styles from "./registro.module.css";

// ==================== ESQUEMAS ZOD ====================
const usuarioSchema = z.object({
  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria").min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre: z.string().min(1, "El nombre es obligatorio").min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(1, "El apellido es obligatorio").min(2, "El apellido debe tener al menos 2 caracteres"),
});

const empresaSchema = z.object({
  documento: z.string().min(1, "El documento es obligatorio").min(3, "El documento debe tener al menos 3 caracteres"),
  razonSocial: z.string().min(1, "La razón social es obligatoria").min(3, "La razón social debe tener al menos 3 caracteres"),
  nombreFantasia: z.string().min(1, "El nombre de fantasía es obligatorio").min(3, "El nombre de fantasía debe tener al menos 3 caracteres"),
  password: z.string().min(1, "La contraseña es obligatoria").min(6, "La contraseña debe tener al menos 6 caracteres"),
  telefono: z.string().min(1, "El teléfono es obligatorio").min(8, "El teléfono debe tener al menos 8 caracteres"),
  direccion: z.string().min(1, "La dirección es obligatoria").min(5, "La dirección debe tener al menos 5 caracteres"),
  web: z.string().optional(),
});

const organizacionSchema = z.object({
  documento: z.string().min(1, "El documento es obligatorio").min(3, "El documento debe tener al menos 3 caracteres"),
  razonSocial: z.string().min(1, "La razón social es obligatoria").min(3, "La razón social debe tener al menos 3 caracteres"),
  nombre: z.string().min(1, "El nombre es obligatorio").min(3, "El nombre debe tener al menos 3 caracteres"),
  password: z.string().min(1, "La contraseña es obligatoria").min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// ==================== TIPOS ====================
type Step = "select" | "usuario" | "empresa" | "organizacion";

type UsuarioData = z.infer<typeof usuarioSchema>;
type EmpresaData = z.infer<typeof empresaSchema>;
type OrganizacionData = z.infer<typeof organizacionSchema>;

type FormType = "usuario" | "empresa" | "organizacion";

type Errors = Record<string, string | undefined>;
type Touched = Record<string, boolean>;

// ==================== COMPONENTE ====================
export default function Registro() {
  const [step, setStep] = useState<Step>("select");

  const [usuarioData, setUsuarioData] = useState<UsuarioData>({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
  });

  const [empresaData, setEmpresaData] = useState<EmpresaData>({
    documento: "",
    razonSocial: "",
    nombreFantasia: "",
    password: "",
    telefono: "",
    direccion: "",
    web: "",
  });

  const [organizacionData, setOrganizacionData] = useState<OrganizacionData>({
    documento: "",
    razonSocial: "",
    nombre: "",
    password: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touchedFields, setTouchedFields] = useState<Touched>({});

  // ==================== VALIDACIÓN ====================
  const validateField = (
    formType: FormType,
    field: string,
    value: string,
    isBlur = false
  ): string | null => {
    if (!isBlur && !touchedFields[field]) return null;

    let schema: any;

    if (formType === "usuario") schema = usuarioSchema;
    else if (formType === "empresa") schema = empresaSchema;
    else schema = organizacionSchema;

    try {
      schema.pick({ [field]: true }).parse({ [field]: value });
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message ?? "Error de validación";
      }
      return "Error de validación";
    }
  };

  const validateAllFields = () => {
    let data: any;
    let schema: any;

    if (step === "usuario") {
      data = usuarioData;
      schema = usuarioSchema;
    } else if (step === "empresa") {
      data = empresaData;
      schema = empresaSchema;
    } else if (step === "organizacion") {
      data = organizacionData;
      schema = organizacionSchema;
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
  const handleChange = (formType: FormType, field: string, value: string) => {
    if (formType === "usuario") {
      setUsuarioData((prev) => ({ ...prev, [field]: value }));
    } else if (formType === "empresa") {
      setEmpresaData((prev) => ({ ...prev, [field]: value }));
    } else {
      setOrganizacionData((prev) => ({ ...prev, [field]: value }));
    }

    if (touchedFields[field]) {
      const error = validateField(formType, field, value, false);
      setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    }
  };

  const handleBlur = (formType: FormType, field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    const value =
      step === "usuario"
        ? usuarioData[field as keyof UsuarioData]
        : step === "empresa"
        ? empresaData[field as keyof EmpresaData]
        : organizacionData[field as keyof OrganizacionData];

    const error = validateField(formType, field, value ?? "", true);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateAllFields();
    if (!validation.isValid) {
      setErrors(validation.errors);

      const allFields: Touched = {};
      const keys =
        step === "usuario"
          ? Object.keys(usuarioData)
          : step === "empresa"
          ? Object.keys(empresaData)
          : Object.keys(organizacionData);

      keys.forEach((k) => (allFields[k] = true));

      setTouchedFields(allFields);
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    console.log("Datos válidos:", {
      usuario: usuarioData,
      empresa: empresaData,
      organizacion: organizacionData,
    });

    alert("Registro exitoso");

    // reset
    setErrors({});
    setTouchedFields({});
    setStep("select");
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
    formType: FormType,
    field: string,
    label: string,
    type = "text",
    placeholder: string,
    options: { optional?: boolean } = {}
  ) => {
    const optional = options.optional ?? false;
    const showError = touchedFields[field] && errors[field];

    const value =
      formType === "usuario"
        ? usuarioData[field as keyof UsuarioData]
        : formType === "empresa"
        ? empresaData[field as keyof EmpresaData]
        : organizacionData[field as keyof OrganizacionData];

    return (
      <div className={styles.fieldGroup}>
        <label className={`${styles.label} ${optional ? styles.optional : ""}`}>
          {label} {!optional && "*"}
        </label>

        <input
          className={getInputClass(field)}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(formType, field, e.target.value)}
          onBlur={() => handleBlur(formType, field)}
        />

        {showError && <span className={styles.errorText}>{errors[field]}</span>}
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
            <div className={styles.card} onClick={() => handleStepChange("usuario")}>
              <Image src="/Registro/Donador_Registro.svg" alt="Usuario" width={80} height={80} />
              <p className={styles.cardText}>Usuario</p>
            </div>

            {/* EMPRESA */}
            <div className={styles.card} onClick={() => handleStepChange("empresa")}>
              <Image src="/Registro/Empresa_Registro.svg" alt="Empresa" width={80} height={80} />
              <p className={styles.cardText}>Empresa</p>
            </div>

            {/* ORGANIZACION */}
            <div className={styles.card} onClick={() => handleStepChange("organizacion")}>
              <Image src="/Registro/Organizacion_Registro.svg" alt="Organización" width={80} height={80} />
              <p className={styles.cardText}>Organización</p>
            </div>
          </div>

          <p className={styles.hint}>Haz clic en una opción para continuar</p>
        </>
      )}

      {/* === FORMULARIOS === */}
      {step === "usuario" && (
        <div className={styles.formWrapper}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <button className={styles.backButton} type="button" onClick={() => handleStepChange("select")}>
                ← Volver
              </button>
              <h2 className={styles.title}>Registro Usuario</h2>
            </div>

            <div className={styles.scrollableFields}>
              {renderField("usuario", "email", "Correo electrónico", "email", "ejemplo@email.com")}
              {renderField("usuario", "password", "Contraseña", "password", "••••••••")}
              {renderField("usuario", "nombre", "Nombre", "text", "Tu nombre")}
              {renderField("usuario", "apellido", "Apellido", "text", "Tu apellido")}
            </div>

            <button disabled={!isFormValid()} className={styles.btn} type="submit">
              Crear cuenta
            </button>
            <p className={styles.requiredHint}>* Campos obligatorios</p>
          </form>
        </div>
      )}

      {step === "empresa" && (
        <div className={styles.formWrapper}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <button className={styles.backButton} type="button" onClick={() => handleStepChange("select")}>
                ← Volver
              </button>
              <h2 className={styles.title}>Registro Empresa</h2>
            </div>

            <div className={styles.scrollableFields}>
              {renderField("empresa", "documento", "Número de documento", "text", "Ej: 30-12345678-9")}
              {renderField("empresa", "razonSocial", "Razón Social", "text", "Nombre legal")}
              {renderField("empresa", "nombreFantasia", "Nombre Fantasía", "text", "Nombre comercial")}
              {renderField("empresa", "password", "Contraseña", "password", "••••••••")}
              {renderField("empresa", "telefono", "Teléfono", "text", "+54 11 1234-5678")}
              {renderField("empresa", "direccion", "Dirección", "text", "Calle y número")}
              {renderField("empresa", "web", "Web", "text", "https://...", { optional: true })}
            </div>

            <button disabled={!isFormValid()} className={styles.btn} type="submit">
              Registrar empresa
            </button>
            <p className={styles.requiredHint}>* Campos obligatorios</p>
          </form>
        </div>
      )}

      {step === "organizacion" && (
        <div className={styles.formWrapper}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <button className={styles.backButton} type="button" onClick={() => handleStepChange("select")}>
                ← Volver
              </button>
              <h2 className={styles.title}>Registro Organización</h2>
            </div>

            <div className={styles.scrollableFields}>
              {renderField("organizacion", "documento", "Número de documento", "text", "12345")}
              {renderField("organizacion", "razonSocial", "Razón Social", "text", "Nombre legal")}
              {renderField("organizacion", "nombre", "Nombre", "text", "Nombre de uso común")}
              {renderField("organizacion", "password", "Contraseña", "password", "••••••••")}
            </div>

            <button disabled={!isFormValid()} className={styles.btn} type="submit">
              Registrar organización
            </button>
            <p className={styles.requiredHint}>* Campos obligatorios</p>
          </form>
        </div>
      )}
    </div>
  );
}
