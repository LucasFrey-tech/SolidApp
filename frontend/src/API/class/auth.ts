import { Crud, PaginatedResponse } from "../service";
import { AuthResponse, LoginRequestBody } from "../types/auth";
import { RegistroUsuarioDto } from "../types/auth";
import { UpdateCredencialesPayload } from "../types/panelUsuario/updateCredenciales";

export class AuthService extends Crud<any> {
  protected endPoint = "/auth";

  async login(credentials: LoginRequestBody): Promise<AuthResponse> {
    const url = `${this.baseUrl}${this.endPoint}/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      let errorMessage = "Error desconocido";
      if (res.status === 401) errorMessage = "Credenciales inválidas.";
      else if (res.status === 403)
        errorMessage = "Usuario bloqueado. Contacte al administrador.";
      else if (res.status >= 500) errorMessage = "Error interno del servidor.";
      throw new Error(errorMessage);
    }

    return res.json();
  }

  async register(data: RegistroUsuarioDto): Promise<AuthResponse> {
    const url = `${this.baseUrl}${this.endPoint}/register`;

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

  async updateCredenciales(
    data: UpdateCredencialesPayload,
  ): Promise<{ message: string }> {
    const url = `${this.baseUrl}${this.endPoint}/credenciales`;

    const res = await fetch(url, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Error al actualizar credenciales";

      if (res.status === 400) {
        const errorData = await res.json();
        errorMessage = errorData.message || "Datos inválidos";
      } else if (res.status === 401) {
        errorMessage = "Contraseña actual incorrecta";
      } else if (res.status === 409) {
        errorMessage = "El email ya está registrado";
      }

      throw new Error(errorMessage);
    }

    return res.json();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}/forgot-password`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });
    return res.json();
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}/reset-password`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ token, newPassword }),
    });
    return res.json();
  }

  getAll(): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  getAllPaginated(
    page?: number,
    limit?: number,
    serach?: string,
    onlyEnabled?: boolean,
  ): Promise<PaginatedResponse<any>> {
    throw new Error("Method not implemented.");
  }
  getOne(_id: number): Promise<any> {
    throw new Error("Method not implemented.");
  }
  create(_data: Partial<any>): Promise<any> {
    throw new Error("Method not implemented.");
  }
  update(_id: number, data: Partial<any>): Promise<any> {
    throw new Error("Method not implemented.");
  }
  delete(_id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
