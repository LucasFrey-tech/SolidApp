import { RegisterUsuarioRequest, RegisterEmpresaRequest, RegisterOrganizacionRequest, AuthResponse } from "@/API/types/register";

export class RegisterService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    console.log("RegisterService baseUrl:", this.baseUrl);
    console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
  }

  async registerUser(data: RegisterUsuarioRequest): Promise<AuthResponse> {
    return this.post("/auth/register/usuario", {
      ...data,
      tipo: "usuario"
    });
  }

  async registerEmpresa(data: RegisterEmpresaRequest): Promise<AuthResponse> {
    return this.post("/auth/register/empresa", {
      ...data,
      tipo: "empresa"
    });
  }

  async registerOrganizacion(data: RegisterOrganizacionRequest): Promise<AuthResponse> {
    return this.post("/auth/register/organizacion", {
      ...data,
      tipo: "organizacion"
    });
  }

  private async post<T>(path: string, data: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    console.log("POST a:", url);
    console.log("Con:", data); 

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    return res.json();
  }
}