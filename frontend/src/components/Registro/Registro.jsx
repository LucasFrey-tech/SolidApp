import { useState } from "react";
import { z } from "zod";
import styles from "./registro.module.css";

// ==================== ESQUEMAS ZOD ====================
const usuarioSchema = z.object({
  email: z.string()
    .min(1, "El email es obligatorio")
    .email("Email inválido"),
  password: z.string()
    .min(1, "La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre: z.string()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string()
    .min(1, "El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres")
});

const empresaSchema = z.object({
  documento: z.string()
    .min(1, "El documento es obligatorio")
    .min(3, "El documento debe tener al menos 3 caracteres"),
  razonSocial: z.string()
    .min(1, "La razón social es obligatoria")
    .min(3, "La razón social debe tener al menos 3 caracteres"),
  nombreFantasia: z.string()
    .min(1, "El nombre de fantasía es obligatorio")
    .min(3, "El nombre de fantasía debe tener al menos 3 caracteres"),
  password: z.string()
    .min(1, "La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  telefono: z.string()
    .min(1, "El teléfono es obligatorio")
    .min(8, "El teléfono debe tener al menos 8 caracteres"),
  direccion: z.string()
    .min(1, "La dirección es obligatoria")
    .min(5, "La dirección debe tener al menos 5 caracteres"),
  web: z.string().optional()
});

const organizacionSchema = z.object({
  documento: z.string()
    .min(1, "El documento es obligatorio")
    .min(3, "El documento debe tener al menos 3 caracteres"),
  razonSocial: z.string()
    .min(1, "La razón social es obligatoria")
    .min(3, "La razón social debe tener al menos 3 caracteres"),
  nombre: z.string()
    .min(1, "El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  password: z.string()
    .min(1, "La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres")
});

// ==================== COMPONENTE ====================
export default function Registro() {
  const [step, setStep] = useState("select");
  
  // Estados para datos
  const [usuarioData, setUsuarioData] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: ""
  });

  const [empresaData, setEmpresaData] = useState({
    documento: "",
    razonSocial: "",
    nombreFantasia: "",
    password: "",
    telefono: "",
    direccion: "",
    web: ""
  });

  const [organizacionData, setOrganizacionData] = useState({
    documento: "",
    razonSocial: "",
    nombre: "",
    password: ""
  });

  // Estados para errores y campos tocados
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Validar solo después de que el usuario interactúa
  const validateField = (formType, field, value, isBlur = false) => {
    // Si es un blur, siempre validar
    // Si no es blur, solo validar si el campo ya fue tocado antes
    if (!isBlur && !touchedFields[field]) {
      return null;
    }

    let schema;
    if (formType === "usuario") schema = usuarioSchema;
    else if (formType === "empresa") schema = empresaSchema;
    else if (formType === "organizacion") schema = organizacionSchema;

    try {
      // Validar solo este campo
      schema.pick({ [field]: true }).parse({ [field]: value });
      return null; // No hay error
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message || "Error de validación";
      }
      return "Error de validación";
    }
  };

  // Validar todo el formulario (para el botón submit)
  const validateAllFields = () => {
    let data, schema;
    
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
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0]] = issue.message;
          }
        });
        return { isValid: false, errors: newErrors };
      }
      return { isValid: false, errors: {} };
    }
  };

  // Verificar si el formulario es válido (para habilitar/deshabilitar botón)
  const isFormValid = () => {
    const validation = validateAllFields();
    return validation.isValid;
  };

  // Manejador de cambios
  const handleChange = (formType, field, value) => {
    // Actualizar datos
    if (formType === "usuario") {
      setUsuarioData(prev => ({ ...prev, [field]: value }));
    } else if (formType === "empresa") {
      setEmpresaData(prev => ({ ...prev, [field]: value }));
    } else if (formType === "organizacion") {
      setOrganizacionData(prev => ({ ...prev, [field]: value }));
    }

    // Solo validar en tiempo real si el campo YA fue tocado
    if (touchedFields[field]) {
      const error = validateField(formType, field, value, false);
      setErrors(prev => ({
        ...prev,
        [field]: error || undefined
      }));
    }
  };

  // Cuando el usuario sale de un campo (onBlur)
  const handleBlur = (formType, field) => {
    // Marcar como tocado
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    // Validar el campo
    let value;
    
    if (step === "usuario") {
      value = usuarioData[field];
    } else if (step === "empresa") {
      value = empresaData[field];
    } else if (step === "organizacion") {
      value = organizacionData[field];
    }

    const error = validateField(formType, field, value, true);
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }));
  };

  // Manejador de envío
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateAllFields();
    
    if (!validation.isValid) {
      // Mostrar todos los errores
      setErrors(validation.errors);
      // Marcar todos los campos como tocados para mostrar errores
      const allFields = {};
      if (step === "usuario") Object.keys(usuarioData).forEach(key => { allFields[key] = true; });
      else if (step === "empresa") Object.keys(empresaData).forEach(key => { allFields[key] = true; });
      else if (step === "organizacion") Object.keys(organizacionData).forEach(key => { allFields[key] = true; });
      
      setTouchedFields(allFields);
      alert("Por favor, completa todos los campos requeridos correctamente.");
      return;
    }

    // Datos válidos
    console.log("Datos válidos:", 
      step === "usuario" ? usuarioData :
      step === "empresa" ? empresaData :
      organizacionData
    );
    
    // Aquí enviarías los datos al backend
    if (step === "usuario") {
      alert("¡Registro de usuario exitoso!");
      setUsuarioData({ email: "", password: "", nombre: "", apellido: "" });
    } else if (step === "empresa") {
      alert("¡Registro de empresa exitoso!");
      setEmpresaData({ documento: "", razonSocial: "", nombreFantasia: "", password: "", telefono: "", direccion: "", web: "" });
    } else if (step === "organizacion") {
      alert("¡Registro de organización exitoso!");
      setOrganizacionData({ documento: "", razonSocial: "", nombre: "", password: "" });
    }

    setErrors({});
    setTouchedFields({});
    setStep("select");
  };

  // Resetear al cambiar de paso
  const handleStepChange = (newStep) => {
    setStep(newStep);
    setErrors({});
    setTouchedFields({});
  };

  // Obtener clase de error para input
  const getInputClass = (fieldName) => {
    const shouldShowError = touchedFields[fieldName] && errors[fieldName];
    return `${styles.input} ${shouldShowError ? styles.inputError : ""}`;
  };

  // Renderizar campo con validación
  const renderField = (formType, field, label, type = "text", placeholder, options = {}) => {
    const isOptional = options.optional || false;
    const shouldShowError = touchedFields[field] && errors[field];
    
    return (
      <div className={styles.fieldGroup}>
        <label className={`${styles.label} ${isOptional ? styles.optional : ""}`}>
          {label} {!isOptional && "*"}
        </label>
        <input
          className={getInputClass(field)}
          type={type}
          placeholder={placeholder}
          value={
            formType === "usuario" ? usuarioData[field] :
            formType === "empresa" ? empresaData[field] :
            organizacionData[field]
          }
          onChange={(e) => handleChange(formType, field, e.target.value)}
          onBlur={() => handleBlur(formType, field)}
        />
        {shouldShowError && (
          <span className={styles.errorText}>{errors[field]}</span>
        )}
      </div>
    );
  };

  return (
    <div className={styles.registroContainer}>
      {step === "select" && (
        <>
          <h2 className={styles.title}>Elige tu tipo de registro</h2>

          <div className={styles.cards}>
            <div className={styles.card} onClick={() => handleStepChange("usuario")}>
              <div className={styles.cardIcon}>👤</div>
              <p className={styles.cardText}>Usuario</p>
            </div>

            <div className={styles.card} onClick={() => handleStepChange("empresa")}>
              <div className={styles.cardIcon}>🏢</div>
              <p className={styles.cardText}>Empresa</p>
            </div>

            <div className={styles.card} onClick={() => handleStepChange("organizacion")}>
              <div className={styles.cardIcon}>🤝</div>
              <p className={styles.cardText}>Organización</p>
            </div>
          </div>

          <p className={styles.hint}>Haz clic en una opción para continuar</p>
        </>
      )}

      {step === "usuario" && (
        <div className={styles.formWrapper}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <button type="button" className={styles.backButton} onClick={() => handleStepChange("select")}>
                ← Volver
              </button>
              <h2 className={styles.title}>Registro Usuario</h2>
            </div>

            <div className={styles.scrollableFields}>
              {renderField("usuario", "email", "Correo electrónico", "email", "ejemplo@email.com")}
              {renderField("usuario", "password", "Contraseña (mínimo 6 caracteres)", "password", "••••••••")}
              {renderField("usuario", "nombre", "Nombre", "text", "Tu nombre")}
              {renderField("usuario", "apellido", "Apellido", "text", "Tu apellido")}
            </div>

            <div className={styles.buttonContainer}>
              <button 
                type="submit" 
                className={styles.btn} 
                disabled={!isFormValid()}
              >
                Crear cuenta
              </button>
              <p className={styles.requiredHint}>* Campos obligatorios</p>
            </div>
          </form>
        </div>
      )}

      {step === "empresa" && (
        <div className={styles.formWrapper}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <button type="button" className={styles.backButton} onClick={() => handleStepChange("select")}>
                ← Volver
              </button>
              <h2 className={styles.title}>Registro Empresa</h2>
            </div>

            <div className={styles.scrollableFields}>
              {renderField("empresa", "documento", "Número de documento", "text", "Ej: 30-12345678-9")}
              {renderField("empresa", "razonSocial", "Razón Social", "text", "Nombre legal de la empresa")}
              {renderField("empresa", "nombreFantasia", "Nombre Fantasía", "text", "Nombre comercial")}
              {renderField("empresa", "password", "Contraseña (mínimo 6 caracteres)", "password", "••••••••")}
              {renderField("empresa", "telefono", "Teléfono (mínimo 8 caracteres)", "text", "+54 11 1234-5678")}
              {renderField("empresa", "direccion", "Dirección", "text", "Calle, número, ciudad")}
              {renderField("empresa", "web", "Web", "text", "https://www.empresa.com", { optional: true })}
            </div>

            <div className={styles.buttonContainer}>
              <button 
                type="submit" 
                className={styles.btn} 
                disabled={!isFormValid()}
              >
                Registrar empresa
              </button>
              <p className={styles.requiredHint}>* Campos obligatorios</p>
            </div>
          </form>
        </div>
      )}

      {step === "organizacion" && (
        <div className={styles.formWrapper}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <button type="button" className={styles.backButton} onClick={() => handleStepChange("select")}>
                ← Volver
              </button>
              <h2 className={styles.title}>Registro Organización</h2>
            </div>

            <div className={styles.scrollableFields}>
              {renderField("organizacion", "documento", "Número de documento", "text", "Número de identificación")}
              {renderField("organizacion", "razonSocial", "Razón Social", "text", "Nombre legal de la organización")}
              {renderField("organizacion", "nombre", "Nombre", "text", "Nombre de uso común")}
              {renderField("organizacion", "password", "Contraseña (mínimo 6 caracteres)", "password", "••••••••")}
            </div>

            <div className={styles.buttonContainer}>
              <button 
                type="submit" 
                className={styles.btn} 
                disabled={!isFormValid()}
              >
                Registrar organización
              </button>
              <p className={styles.requiredHint}>* Campos obligatorios</p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}