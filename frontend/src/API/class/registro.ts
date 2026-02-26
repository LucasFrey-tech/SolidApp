import { AuthResponse, Register } from "../types/auth";
import { Crud, PaginatedResponse } from "../service";

export class RegisterService extends Crud<Register> {
  constructor() {
    super();
    console.log("RegisterService baseUrl:", this.baseUrl);
    console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
  }

  async register(data: Register): Promise<AuthResponse> {
    console.log("DTO recibido:", JSON.stringify(data, null, 2));
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
