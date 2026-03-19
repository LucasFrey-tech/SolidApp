"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import Image from "next/image";
import styles from "../../styles/login-registro/registro.module.css";
import { baseApi } from "@/API/baseApi";
import { NumericInput } from "../Utils/NumericInputProp";
import Swal from "sweetalert2";
import { useSearchParams } from 'next/navigation';

/* ==================== UTILIDAD CUIT ==================== */

const formatCuit = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
};

const stripCuit = (formatted: string): string => formatted.replace(/\D/g, "");

const formatTelefono = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

const stripTelefono = (formatted: string): string =>
  formatted.replace(/\D/g, "");

const empresaSchema = z
  .object({
    nombre: z.string().min(2, "Nombre inválido"),
    apellido: z.string().min(2, "Apellido inválido"),
    documento: z.string().min(7, "Documento inválido"),
    correo: z.string().email("Email inválido"),
    clave: z.string().min(6, "Mínimo 6 caracteres"),
    confirmarClave: z.string(),
    prefijo: z.string().min(2, "prefijo invalido"),
    telefono: z.string().min(8, "Teléfono inválido"),
    correo_empresa: z.string().email("Email de empresa inválido"),
    cuit_empresa: z.string().length(11, "El CUIT debe tener 11 dígitos"),
    razon_social: z.string().min(3, "Razón social inválida"),
    nombre_empresa: z.string().min(3, "Nombre de fantasía inválido"),
    calle: z.string().min(3, "Calle inválida"),
    numero: z.string().min(1, "Número inválido"),
    web: z.string().optional(),
  })
  .refine((d) => d.clave === d.confirmarClave, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarClave"],
  });

const organizacionSchema = z
  .object({
    nombre: z.string().min(2, "Nombre inválido"),
    apellido: z.string().min(2, "Apellido inválido"),
    documento: z.string().min(7, "Documento inválido"),
    correo: z.string().email("Email inválido"),
    clave: z.string().min(6, "Mínimo 6 caracteres"),
    confirmarClave: z.string(),
    prefijo: z.string().min(2, "prefijo invalido"),
    telefono: z.string().min(8, "Teléfono inválido"),
    correo_organizacion: z.string().email("Email de organización inválido"),
    cuit_organizacion: z.string().length(11, "El CUIT debe tener 11 dígitos"),
    razon_social: z.string().min(3, "Razón social inválida"),
    nombre_organizacion: z.string().min(3, "Nombre inválido"),
    calle: z.string().min(3, "Calle inválida"),
    numero: z.string().min(1, "Número inválido"),
    web: z.string().optional(),
  })
  .refine((d) => d.clave === d.confirmarClave, {
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

type FieldConfig = {
  field: string;
  label: string;
  type: string;
  placeholder: string;
  optional?: boolean;
};

const numericFields = ["documento", "numero"];

const cuitFields = ["cuit_empresa", "cuit_organizacion"];

const fieldConfigs: Record<FormType, FieldConfig[]> = {
  empresa: [
    {
      field: "nombre",
      label: "Nombre del colaborador",
      type: "text",
      placeholder: "Juan",
    },
    {
      field: "apellido",
      label: "Apellido del colaborador",
      type: "text",
      placeholder: "Pérez",
    },
    {
      field: "documento",
      label: "DNI del colaborador",
      type: "text",
      placeholder: "12345678",
    },
    {
      field: "correo",
      label: "Correo del colaborador",
      type: "email",
      placeholder: "colaborador@empresa.com",
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
      placeholder: "1123456789",
    },
    {
      field: "correo_empresa",
      label: "Correo de la empresa",
      type: "email",
      placeholder: "contacto@empresa.com",
    },
    {
      field: "cuit_empresa",
      label: "CUIT empresa",
      type: "text",
      placeholder: "30-12345678-9",
    },
    {
      field: "razon_social",
      label: "Razón social",
      type: "text",
      placeholder: "Empresa SA",
    },
    {
      field: "nombre_empresa",
      label: "Nombre de fantasía",
      type: "text",
      placeholder: "Nombre comercial",
    },
    {
      field: "calle",
      label: "Calle",
      type: "text",
      placeholder: "Av. Siempre Viva",
    },
    { field: "numero", label: "Número", type: "text", placeholder: "742" },
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
      field: "nombre",
      label: "Nombre del colaborador",
      type: "text",
      placeholder: "Juan",
    },
    {
      field: "apellido",
      label: "Apellido del colaborador",
      type: "text",
      placeholder: "Pérez",
    },
    {
      field: "documento",
      label: "DNI del colaborador",
      type: "text",
      placeholder: "12345678",
    },
    {
      field: "correo",
      label: "Correo del colaborador",
      type: "email",
      placeholder: "colaborador@organizacion.com",
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
      placeholder: "1123456789",
    },
    {
      field: "correo_organizacion",
      label: "Correo de la organización",
      type: "email",
      placeholder: "contacto@organizacion.com",
    },
    {
      field: "cuit_organizacion",
      label: "CUIT organización",
      type: "text",
      placeholder: "30-12345678-9",
    },
    {
      field: "razon_social",
      label: "Razón social",
      type: "text",
      placeholder: "Fundación Ayudar",
    },
    {
      field: "nombre_organizacion",
      label: "Nombre",
      type: "text",
      placeholder: "Nombre público",
    },
    {
      field: "calle",
      label: "Calle",
      type: "text",
      placeholder: "Av. Siempre Viva",
    },
    { field: "numero", label: "Número", type: "text", placeholder: "742" },
    {
      field: "web",
      label: "Web",
      type: "text",
      placeholder: "https://...",
      optional: true,
    },
  ],
};

const initialEmpresaData: EmpresaData = {
  nombre: "",
  apellido: "",
  documento: "",
  correo: "",
  clave: "",
  confirmarClave: "",
  prefijo: "",
  telefono: "",
  correo_empresa: "",
  cuit_empresa: "",
  razon_social: "",
  nombre_empresa: "",
  calle: "",
  numero: "",
  web: "",
};

const initialOrganizacionData: OrganizacionData = {
  nombre: "",
  apellido: "",
  documento: "",
  correo: "",
  clave: "",
  confirmarClave: "",
  prefijo: "",
  telefono: "",
  correo_organizacion: "",
  cuit_organizacion: "",
  razon_social: "",
  nombre_organizacion: "",
  calle: "",
  numero: "",
  web: "",
};

export default function RegistroEntidades() {
  const [step, setStep] = useState<Step>("select");

  const searchParams = useSearchParams();
  const token = searchParams.get('token')

  const [empresaData, setEmpresaData] =
    useState<EmpresaData>(initialEmpresaData);
  const [organizacionData, setOrganizacionData] = useState<OrganizacionData>(
    initialOrganizacionData,
  );

  const [cuitDisplay, setCuitDisplay] = useState("");
  const [telefonoDisplay, setTelefonoDisplay] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});

  const [correoBloqueado, setCorreoBloqueado] = useState(false);
  const [loadingInvitacion, setLoadingInvitacion] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setLoadingInvitacion(false);
      return;
    }

    const validarInvitacion = async () => {
      try {
        const invitacion = await baseApi.invitacionesOrg.validarToken(token);

        setEmpresaData(prev => ({
          ...prev,
          correo: invitacion.correo,
        }));
        setOrganizacionData(prev => ({
          ...prev,
          correo: invitacion.correo,
        }));

        setCorreoBloqueado(true);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Invitación inválida",
          text: "La invitación no es válida o expiró",
        });
      } finally {
        setLoadingInvitacion(false);
      }
    };

    validarInvitacion();
  }, [token]);

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

  const validateField = (
    field: string,
    data: Record<string, string>,
  ): string | undefined => {
    const schema = getCurrentSchema();
    if (!schema) return undefined;
    try {
      schema.parse(data);
      return undefined;
    } catch (e) {
      if (e instanceof z.ZodError)
        return e.issues.find((i) => i.path[0] === field)?.message;
      return undefined;
    }
  };

  const validateAll = () => {
    const schema = getCurrentSchema();
    const data = getCurrentData();
    if (!schema || !data) return { isValid: false, errors: {} };
    try {
      schema.parse(data);
      return { isValid: true, errors: {} };
    } catch (e) {
      if (e instanceof z.ZodError) {
        const errs: Errors = {};
        e.issues.forEach((i) => {
          errs[i.path[0] as string] = i.message;
        });
        return { isValid: false, errors: errs };
      }
      return { isValid: false, errors: {} };
    }
  };

  const handleChange = (field: string, value: string) => {
    if (cuitFields.includes(field)) {
      const formatted = formatCuit(value);
      const digits = stripCuit(formatted);
      setCuitDisplay(formatted);

      if (field === "cuit_empresa") {
        const next = { ...empresaData, cuit_empresa: digits };
        setEmpresaData(next);
        if (touched[field]) {
          const error = validateField(field, next as Record<string, string>);
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      } else {
        const next = { ...organizacionData, cuit_organizacion: digits };
        setOrganizacionData(next);
        if (touched[field]) {
          const error = validateField(field, next as Record<string, string>);
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      }
      return;
    }

    if (field === "telefono") {
      const formatted = formatTelefono(value);
      const digits = stripTelefono(formatted);
      const prefijo = digits.slice(0, 2);
      const numero = digits.slice(2);
      setTelefonoDisplay(formatted);

      if (step === "empresa") {
        const next = { ...empresaData, prefijo, telefono: numero };
        setEmpresaData(next);
        if (touched[field]) {
          const error = validateField(field, next as Record<string, string>);
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      } else if (step === "organizacion") {
        const next = { ...organizacionData, prefijo, telefono: numero };
        setOrganizacionData(next);
        if (touched[field]) {
          const error = validateField(field, next as Record<string, string>);
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      }
      return;
    }

    if (step === "empresa") {
      const next = { ...empresaData, [field]: value };
      setEmpresaData(next);
      if (touched[field]) {
        const error = validateField(field, next as Record<string, string>);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    }

    if (step === "organizacion") {
      const next = { ...organizacionData, [field]: value };
      setOrganizacionData(next);
      if (touched[field]) {
        const error = validateField(field, next as Record<string, string>);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const data = getCurrentData();
    if (!data) return;
    const error = validateField(field, data as Record<string, string>);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleVolver = () => {
    setErrors({});
    setTouched({});
    setCuitDisplay("");
    setTelefonoDisplay("");
    setStep("select");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors: allErrors } = validateAll();

    if (!isValid) {
      const allTouched: Touched = {};
      Object.keys(allErrors).forEach((k) => {
        allTouched[k] = true;
      });
      setTouched(allTouched);
      setErrors(allErrors);
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Corregí los errores antes de continuar",
      });
      return;
    }

    try {
      if (step === "empresa") {
        const { confirmarClave, ...payload } = empresaData;
        await baseApi.empresa.registrarEmpresa({ ...payload, token: token || undefined });
      }

      if (step === "organizacion") {
        const { confirmarClave, ...payload } = organizacionData;
        const { cuit_organizacion, ...rest } = payload;
        await baseApi.organizacion.registrarOrganizacion({
          ...rest,
          cuit_organizacion: cuit_organizacion,
          token: token || undefined,
        });
      }

      Swal.fire({ icon: "success", title: "Registro exitoso" });
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
    optional?: boolean,
  ) => {
    const data = getCurrentData();

    const value = cuitFields.includes(field)
      ? cuitDisplay
      : field === "telefono"
        ? telefonoDisplay
        : data
          ? ((data as Record<string, string>)[field] ?? "")
          : "";

    const isNumeric = numericFields.includes(field);
    const showError = touched[field] && errors[field];

    return (
      <div key={field} className={styles.fieldGroup}>
        <label className={styles.label}>
          {label} {!optional && "*"}
        </label>

        {isNumeric ? (
          <NumericInput
            className={`${styles.input} ${showError ? styles.inputError : ""}`}
            value={value}
            placeholder={placeholder}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
          />
        ) : (
          <input
            className={`${styles.input} ${showError ? styles.inputError : ""}`}
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
          />
        )}

        {showError && <span className={styles.errorText}>{errors[field]}</span>}
      </div>
    );
  };

  const renderForm = (formType: FormType) => (
    <div className={styles.formWrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <button
          className={styles.backButton}
          type="button"
          onClick={handleVolver}
        >
          Volver
        </button>

        <h2 className={styles.title}>
          Registro {formType === "empresa" ? "Empresa" : "Organización"}
        </h2>

        <div className={styles.scrollableFields}>
          {fieldConfigs[formType].map((c) =>
            renderField(c.field, c.label, c.type, c.placeholder, c.optional),
          )}
        </div>

        <button className={styles.btn} type="submit">
          Registrar
        </button>
      </form>
    </div>
  );

  return (
    <div className={styles.registroContainer}>
      {step === "select" && (
        <>
          <h2 className={styles.title}>Seleccionar el tipo de registro</h2>
          <div className={styles.cards}>
            <div className={styles.card} onClick={() => setStep("empresa")}>
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
