import { AuthResponse, RegistroUsuarioDto } from "../types/auth";
import { Crud, PaginatedResponse } from "../service";

export class RegisterService extends Crud<RegistroUsuarioDto> {
  constructor() {
    super();
  }

  async register(data: RegistroUsuarioDto): Promise<AuthResponse> {
    const url = `${this.baseUrl}/auth/register`;

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

  getAll(): Promise<RegistroUsuarioDto[]> {
    throw new Error("Method not implemented");
  }

  getAllPaginated(
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<RegistroUsuarioDto>> {
    throw new Error("Method not implemented");
  }

  getOne(_id: number): Promise<RegistroUsuarioDto> {
    throw new Error("Method not implemented.");
  }

  create(_data: Partial<RegistroUsuarioDto>): Promise<RegistroUsuarioDto> {
    throw new Error("Method not implemented.");
  }

  update(
    _id: number,
    data: Partial<RegistroUsuarioDto>,
  ): Promise<RegistroUsuarioDto> {
    throw new Error("Method not implemented.");
  }

  delete(_id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
