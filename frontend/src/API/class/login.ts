import { Crud, PaginatedResponse } from "../service";
import { LoginRequestBody, AuthResponse } from "../types/auth";

export class Login extends Crud<LoginRequestBody> {
  protected endPoint = "auth";

  async loginUser(credentials: LoginRequestBody): Promise<AuthResponse> {
    return this.login(`/${this.endPoint}/sesion/usuario`, credentials);
  }

  async loginEmpresa(credentials: LoginRequestBody): Promise<AuthResponse> {
    return this.login(`/${this.endPoint}/sesion/empresa`, credentials);
  }

  async loginOrganizacion(
    credentials: LoginRequestBody,
  ): Promise<AuthResponse> {
    return this.login(`/${this.endPoint}/sesion/organizacion`, credentials);
  }

  private async login(
    path: string,
    data: LoginRequestBody,
  ): Promise<AuthResponse> {
    const url = `${this.baseUrl}${path}`;
    console.log("POST a:", url);
    console.log("Con:", data);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      let errorMessage = "Error desconocido";
      if (res.status === 401) {
        errorMessage = "Credenciales inválidas. Error al iniciar sesión.";
      } else if (res.status === 403) {
        errorMessage = "Usuario bloqueado. Contacte al administrador.";
      } else if (res.status === 404) {
        errorMessage = `Endpoint no encontrado: ${url}`;
      } else if (res.status >= 500) {
        errorMessage = "Error interno del servidor. Intente más tarde.";
      }

      throw new Error(errorMessage);
    }
    const json = await res.json();
    return json as AuthResponse;
  }

  async getAll(): Promise<never[]> {
    throw new Error("Method getAll not supported for Auth");
  }

  async getOne(_id: number): Promise<never> {
    throw new Error("Method getOne not supported for Auth");
  }
  getAllPaginated(
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<LoginRequestBody>> {
    throw new Error("Method not implemented.");
  }

  async create(_data: Partial<LoginRequestBody>): Promise<LoginRequestBody> {
    throw new Error("Method create not supported for Auth");
  }

  async update(_id: number, _data: Partial<never>): Promise<never> {
    throw new Error("Method update not supported for Auth");
  }
  async delete(_id: number): Promise<void> {
    throw new Error("Method delete not supported for Auth");
  }
}
