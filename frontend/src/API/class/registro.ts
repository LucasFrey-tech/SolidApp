import {
  RegisterUsuarioRequest,
  RegisterEmpresaRequest,
  RegisterOrganizacionRequest,
  AuthResponse,
  Register,
} from "@/API/types/register";
import { Crud, PaginatedResponse } from "../service";

export class RegisterService extends Crud<Register> {
  constructor() {
    super();
    console.log("RegisterService baseUrl:", this.baseUrl);
    console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
  }

  async registerUser(data: RegisterUsuarioRequest): Promise<AuthResponse> {
    return this.post("/auth/register/usuario", data);
  }

  async registerEmpresa(data: RegisterEmpresaRequest): Promise<AuthResponse> {
    return this.post("/auth/register/empresa", data);
  }

  async registerOrganizacion(
    data: RegisterOrganizacionRequest,
  ): Promise<AuthResponse> {
    return this.post("/auth/register/organizacion", data);
  }

  private async post<T>(path: string, data: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    console.log("POST a:", url);
    console.log("Con:", data);

    const res = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {

      let errorData;

      try {
        errorData = await res.json();
      } catch {
        errorData = { message: await res.text() };
      }

      throw {
        status: res.status,
        message: errorData.message || "Error desconocido",
        error: errorData.error || null,
      };
    }

    return res.json();
  }

  getAll(): Promise<Register[]> {
    throw new Error("Method not implemented");
  }

  getAllPaginated(
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<Register>> {
    throw new Error("Method not implemented");
  }

  getOne(_id: number): Promise<Register> {
    throw new Error("Method not implemented.");
  }

  create(_data: Partial<Register>): Promise<Register> {
    throw new Error("Method not implemented.");
  }

  update(_id: number, data: Partial<Register>): Promise<Register> {
    throw new Error("Method not implemented.");
  }

  delete(_id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}