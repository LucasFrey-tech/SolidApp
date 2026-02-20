"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "@/styles/login-registro/registro.module.css";
import { baseApi } from "@/API/baseApi";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";

import Swal from "sweetalert2";

// ==================== Estrategias =====================

import { LoginUsuarioStrategy } from "@/API/class/login/usuario";
import { LoginEmpresaStrategy } from "@/API/class/login/empresa";
import { LoginOrganizacionStrategy } from "@/API/class/login/organizacion";

// ==================== TIPOS ====================

type UserType = "usuario" | "empresa" | "organizacion";
type Step = "select" | UserType;

interface LoginData {
  correo: string;
  clave: string;
}

interface Errors {
  correo?: string;
  clave?: string;
  general?: string;
}

type loginStrategy =
  | LoginUsuarioStrategy
  | LoginEmpresaStrategy
  | LoginOrganizacionStrategy;

const validateEmail = (email: string): string => {
  if (!email) return "El email es obligatorio";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email inválido";
  return "";
};

const validatePassword = (password: string): string => {
  if (!password) return "La contraseña es obligatoria";
  if (password.length < 6) return "Mínimo 6 caracteres";
  return "";
};

interface DecodedToken {
  email: string;
  sub: number;
  username: string;
  admin: boolean;
  userType: UserType;
}

// ==================== COMPONENTE ====================

export default function Login() {
  const router = useRouter();
  const { setUser, refreshUser } = useUser();

  const [step, setStep] = useState<Step>("select");

  const [loginData, setLoginData] = useState<LoginData>({
    correo: "",
    clave: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ==================== STRATEGY ====================

  const getCurrentStrategy = (): loginStrategy | null => {
    if (step === "select") return null;

    switch (step) {
      case "usuario":
        return new LoginUsuarioStrategy(baseApi.log);

      case "empresa":
        return new LoginEmpresaStrategy(baseApi.log);

      case "organizacion":
        return new LoginOrganizacionStrategy(baseApi.log);

      default:
        return null;
    }
  };

  // ==================== VALIDACIÓN ====================

  const validateField = (field: keyof LoginData, value: string): string => {
    switch (field) {
      case "correo":
        return validateEmail(value);

      case "clave":
        return validatePassword(value);

      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    newErrors.correo = validateEmail(loginData.correo);
    newErrors.clave = validatePassword(loginData.clave);

    setErrors(newErrors);

    return !newErrors.correo && !newErrors.clave;
  };

  // ==================== INPUT EVENTS ====================

  const handleChange = (field: keyof LoginData, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      const error = validateField(field, value);

      setErrors((prev) => ({
        ...prev,
        [field]: error || undefined,
      }));
    }
  };

  const handleBlur = (field: keyof LoginData) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    const error = validateField(field, loginData[field]);

    setErrors((prev) => ({
      ...prev,
      [field]: error || undefined,
    }));
  };

  // ==================== LOGIN ====================

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === "select") {
      await Swal.fire({
        icon: "warning",
        title: "Selecciona un tipo de usuario",
      });

      return;
    }

    setTouched({
      correo: true,
      clave: true,
    });

    if (!validateForm()) {
      await Swal.fire({
        icon: "error",
        title: "Formulario inválido",
        text: "Corrige los errores antes de continuar",
      });

      return;
    }

    setIsLoading(true);

    setErrors((prev) => ({
      ...prev,
      general: undefined,
    }));

    try {
      const strategy = getCurrentStrategy();

      if (!strategy) {
        throw new Error("Tipo de usuario no válido");
      }

      let response;

      switch (step) {
        case "usuario":
          response = await (
            strategy as LoginUsuarioStrategy
          ).login(loginData);
          break;

        case "empresa":
          response = await (
            strategy as LoginEmpresaStrategy
          ).login(loginData);
          break;

        case "organizacion":
          response = await (
            strategy as LoginOrganizacionStrategy
          ).login(loginData);
          break;

        default:
          throw new Error("Tipo no soportado");
      }

      const token = response.token;

      if (!token) {
        throw new Error("No se recibió token");
      }

      localStorage.setItem("token", token);

      const decoded = jwtDecode<DecodedToken>(token);

      console.log("TOKEN DECODIFICADO COMPLETO: ", decoded);

      setUser({
        email: decoded.email || loginData.correo,
        sub: decoded.sub,
        username: decoded.username || loginData.correo.split("@")[0],
        userType: decoded.userType,
      });

      refreshUser();

      window.dispatchEvent(
        new Event("custom-storage-change")
      );

      router.refresh();

      await Swal.fire({
        icon: "success",
        title: "Login exitoso",
        text: `Bienvenido ${loginData.correo.split('@')[0]}`,
        timer: 1500,
        showConfirmButton: false,
      });

      router.replace("/inicio");
    } catch (error) {
      console.error(error);

      await Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: "Verifica tus credenciales",
      });

      setErrors({
        general:
          "Error al iniciar sesión. Verifica tus credenciales.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== STEP ====================

  const handleStepChange = (newStep: Step) => {
    setStep(newStep);

    setErrors({});

    setTouched({});

    setLoginData({
      correo: "",
      clave: "",
    });
  };

  const getInputClass = (field: keyof LoginData) => {
    const showError = touched[field] && errors[field];

    return `${styles.input} ${
      showError ? styles.inputError : ""
    }`;
  };

  // ==================== JSX ====================

  return (
    <div className={styles.registroContainer}>
      {step === "select" ? (
        <>
          <h2 className={styles.title}>
            Selecciona tu tipo de Inicio de Sesión
          </h2>

          <div className={styles.cards}>
            <div
              className={styles.card}
              onClick={() =>
                handleStepChange("usuario")
              }
            >
              <Image
                src="/Registro/Donador_Registro.svg"
                alt="Usuario"
                width={80}
                height={80}
              />

              <p className={styles.cardText}>
                Usuario
              </p>
            </div>

            <div
              className={styles.card}
              onClick={() =>
                handleStepChange("empresa")
              }
            >
              <Image
                src="/Registro/Empresa_Registro.svg"
                alt="Empresa"
                width={80}
                height={80}
              />

              <p className={styles.cardText}>
                Empresa
              </p>
            </div>

            <div
              className={styles.card}
              onClick={() =>
                handleStepChange("organizacion")
              }
            >
              <Image
                src="/Registro/Organizacion_Registro.svg"
                alt="Organización"
                width={80}
                height={80}
              />

              <p className={styles.cardText}>
                Organización
              </p>
            </div>
          </div>

          <p className={styles.hint}>
            Haz clic en una opción para continuar
          </p>

          <div className={styles.switchForm}>
            <p>
              ¿No tienes cuenta?{" "}
              <a
                href="/registro"
                className={styles.link}
              >
                Regístrate aquí
              </a>
            </p>
          </div>
        </>
      ) : (
        <div className={styles.formWrapper}>
          <form
            className={styles.form}
            onSubmit={handleLogin}
          >
            <div className={styles.formHeader}>
              <button
                className={styles.backButton}
                type="button"
                onClick={() =>
                  handleStepChange("select")
                }
              >
                ← Volver
              </button>

              <h2 className={styles.title}>
                Iniciar Sesión como{" "}
                {step.charAt(0).toUpperCase() +
                  step.slice(1)}
              </h2>
            </div>

            <div className={styles.scrollableFields}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Correo electrónico
                </label>

                <input
                  className={getInputClass(
                    "correo"
                  )}
                  type="email"
                  placeholder="Ingresar correo electrónico"
                  value={loginData.correo}
                  onChange={(e) =>
                    handleChange(
                      "correo",
                      e.target.value
                    )
                  }
                  onBlur={() =>
                    handleBlur("correo")
                  }
                />

                {touched.correo &&
                  errors.correo && (
                    <span
                      className={
                        styles.errorText
                      }
                    >
                      {errors.correo}
                    </span>
                  )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Contraseña
                </label>

                <input
                  className={getInputClass(
                    "clave"
                  )}
                  type="password"
                  value={loginData.clave}
                  placeholder="Ingresar contraseña"
                  onChange={(e) =>
                    handleChange(
                      "clave",
                      e.target.value
                    )
                  }
                  onBlur={() =>
                    handleBlur("clave")
                  }
                />

                {touched.clave &&
                  errors.clave && (
                    <span
                      className={
                        styles.errorText
                      }
                    >
                      {errors.clave}
                    </span>
                  )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.btn}
            >
              {isLoading
                ? "Iniciando sesión..."
                : "Iniciar sesión"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}