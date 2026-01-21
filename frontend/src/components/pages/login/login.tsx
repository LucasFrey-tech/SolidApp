import { useState } from "react";
import Image from "next/image";
import styles from "@/styles/registro.module.css";
import { BaseApi } from "@/API/baseApi";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";

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
  | LoginOrganizacionStrategy

// ==================== VALIDACIÓN SIMPLE ====================
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
}

// ==================== COMPONENTE ====================
export default function Login() {
  const router = useRouter();
  const { setUser, refreshUser } = useUser();
  const [step, setStep] = useState<Step>("select");
  const [api] = useState(() => new BaseApi());
  
  // ==================== ESTADOS SIMPLIFICADOS ====================
  const [loginData, setLoginData] = useState<LoginData>({
    correo: "",
    clave: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ==================== OBTENER ESTRATEGIA ACTUAL ====================
  const getCurrentStrategy = (): loginStrategy | null => {
    if (step === "select") return null;
    
    switch (step) {
      case "usuario":
        return new LoginUsuarioStrategy(api.log);
      case "empresa":
        return new LoginEmpresaStrategy(api.log);
      case "organizacion":
        return new LoginOrganizacionStrategy(api.log);
      default:
        return null;
    }
  };

  // ==================== VALIDACIÓN SIMPLE ====================
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

  // ==================== EVENTOS ====================
  const handleChange = (field: keyof LoginData, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    
    // Validar en tiempo real si el campo ya fue tocado
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }
  };

  const handleBlur = (field: keyof LoginData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const error = validateField(field, loginData[field]);
    setErrors(prev => ({ ...prev, [field]: error || undefined }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === "select") {
      alert("Por favor, selecciona un tipo de usuario");
      return;
    }

    // Marcar todos los campos como tocados
    setTouched({ correo: true, clave: true });

    // Validar formulario
    if (!validateForm()) {
      alert("Por favor, corrige los errores en el formulario");
      return;
    }

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: undefined }));
    
    try {
      const strategy = getCurrentStrategy();
      if (!strategy) {
        throw new Error("Tipo de usuario no válido");
      }

      // Ejecutar login con la estrategia correspondiente
      let response;
      switch (step) {
        case "usuario":
          response = await (strategy as LoginUsuarioStrategy).login(loginData);
          break;
        case "empresa":
          response = await (strategy as LoginEmpresaStrategy).login(loginData);
          break;
        case "organizacion":
          response = await (strategy as LoginOrganizacionStrategy).login(loginData);
          break;
        default:
          throw new Error("Tipo de usuario no soportado");
      }

      console.log("Login Exitoso: ", response);
      
      const token = response.token;
      if (!token) {
        console.error("La API no devolvió 'token':", response);
        throw new Error("Error del servidor: No se recibió token");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user_email", loginData.correo);

      const decoded = jwtDecode<DecodedToken>(token);
      console.log("Token decodificador: ", decoded);

      setUser({
        email: decoded.email || loginData.correo,
        sub: decoded.sub,
        username: decoded.username || loginData.correo.split('@')[0],
        admin: decoded.admin || false
      });

      
      refreshUser();
      
      window.dispatchEvent(new Event('custom-storage-change'));
      
      router.refresh();

      setErrors({ general: `¡Bienvenido! Redirigiendo...` });

      setTimeout(() => {
        router.replace('/inicio')
      }, 1500);

      alert(`¡Bienvenido! Has iniciado sesión como ${step}`);

    } catch (error) {
      console.error("Error en login:", error);
      setErrors({ general: "Error al iniciar sesión. Verifica tus credenciales." });
      alert("Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepChange = (newStep: Step) => {
    setStep(newStep);
    setErrors({});
    setTouched({});
    setLoginData({ correo: "", clave: "" });
  };

  const getInputClass = (field: keyof LoginData) => {
    const showError = touched[field] && errors[field];
    return `${styles.input} ${showError ? styles.inputError : ""}`;
  };

  // ==================== JSX ====================
  return (
    <div className={styles.registroContainer}>
      {step === "select" ? (
        <>
          <h2 className={styles.title}>Selecciona tu tipo de Inicio de Sesión</h2>

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
          
          <div className={styles.switchForm}>
            <p>
              ¿No tienes cuenta?{" "}
              <a href="/registro" className={styles.link}>
                Regístrate aquí
              </a>
            </p>
          </div>
        </>
      ) : (
        <div className={styles.formWrapper}>
          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.formHeader}>
              <button
                className={styles.backButton}
                type="button"
                onClick={() => handleStepChange("select")}
                disabled={isLoading}
              >
                ← Volver
              </button>
              <h2 className={styles.title}>
                Iniciar Sesión como {step.charAt(0).toUpperCase() + step.slice(1)}
              </h2>
            </div>

            <div className={styles.scrollableFields}>
              {/* Email */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Correo electrónico *</label>
                <input
                  className={getInputClass("correo")}
                  type="email"
                  placeholder="ejemplo@email.com"
                  value={loginData.correo}
                  onChange={(e) => handleChange("correo", e.target.value)}
                  onBlur={() => handleBlur("correo")}
                  disabled={isLoading}
                />
                {touched.correo && errors.correo && (
                  <span className={styles.errorText}>{errors.correo}</span>
                )}
              </div>

              {/* Password */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Contraseña *</label>
                <input
                  className={getInputClass("clave")}
                  type="password"
                  placeholder="••••••••"
                  value={loginData.clave}
                  onChange={(e) => handleChange("clave", e.target.value)}
                  onBlur={() => handleBlur("clave")}
                  disabled={isLoading}
                />
                {touched.clave && errors.clave && (
                  <span className={styles.errorText}>{errors.clave}</span>
                )}
              </div>
            </div>

            <button
              disabled={isLoading}
              className={`${styles.btn} ${isLoading ? styles.btnLoading : ""}`}
              type="submit"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
            
            <div className={styles.extraLinks}>
              <a href="/recuperar-password" className={styles.link}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}