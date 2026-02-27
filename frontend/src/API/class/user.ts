import { Crud, PaginatedResponse } from "../service";
import { Beneficio, UsuarioBeneficio } from "../types/beneficios";
import {
  CreateDonation,
  donacionUsuario,
  Donation,
} from "../types/donaciones/donaciones";
import { User, UserPoints } from "../types/user";

export class Users extends Crud<User> {
  private endPoint = "users";

  // =====Panel del usuario=====

  async getPerfil(): Promise<User> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/perfil`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Error al obtener perfil (${res.status})`);
    return res.json();
  }

  async updatePerfil(data: Partial<User>): Promise<User> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/perfil`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorDetails = await res.json().catch(() => res.text());
      throw new Error(
        `Error al actualizar perfil (${res.status}): ${JSON.stringify(errorDetails)}`,
      );
    }

    return res.json();
  }

  async getPoints(): Promise<UserPoints> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/puntos`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al obtener puntos (${res.status}): ${errorDetails}`,
      );
    }
    return res.json();
  }

  async createDonacion(data: CreateDonation): Promise<Donation> {
    const url = `${this.baseUrl}/${this.endPoint}/donaciones`;
    console.log("URL COMPLETA:", url);
    console.log("baseUrl:", this.baseUrl);
    console.log("endPoint:", this.endPoint);
    console.log("Headers:", this.getHeaders());

    const res = await fetch(`${this.baseUrl}/${this.endPoint}/donaciones`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    return res.json();
  }

  async getDonaciones(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<donacionUsuario>> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/donaciones?page=${page}&limit=${limit}`,
      { method: "GET", headers: this.getHeaders() },
    );
    if (!res.ok) throw new Error(`Error al obtener donaciones (${res.status})`);
    return res.json();
  }

  async canjearCupon(cuponId: number, cantidad = 1): Promise<Beneficio> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/cupones/${cuponId}/canjear?cantidad=${cantidad}`,
      { method: "POST", headers: this.getHeaders() },
    );
    if (!res.ok) throw new Error(`Error al canjear cupón (${res.status})`);
    return res.json();
  }

  async getMisCuponesCanjeados(): Promise<UsuarioBeneficio[]> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/cupones`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Error al obtener cupones (${res.status})`);
    return res.json();
  }

  async usarCupon(usuarioBeneficioId: number): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/cupones/${usuarioBeneficioId}`,
      { method: "POST", headers: this.getHeaders() },
    );
    if (!res.ok) throw new Error(`Error al usar cupón (${res.status})`);
  }

  // =====Panel Admin=====

  async getAllPaginated(
    page: number = 1,
    limit: number = 10,
    search: string = "",
  ): Promise<PaginatedResponse<User>> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/users/admin/list?page=${page}&limit=${limit}&search=${search}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      },
    );
    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al obtener usuarios paginados (${res.status}): ${errorDetails}`,
      );
    }
    return res.json();
  }

  async delete(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al deshabilitar usuario (${res.status}): ${errorDetails}`,
      );
    }
  }

  async restore(id: number): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/${id}/restaurar`,
      {
        method: "PATCH",
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      const errorDetails = await res.text().catch(() => "Error desconocido");
      throw new Error(
        `Error al restaurar/habilitar usuario (${res.status}): ${errorDetails}`,
      );
    }
  }

  // Metodos no implementados
  getAll(): Promise<User[]> {
    throw new Error("Method not implemented.");
  }
  getOne(_id: number): Promise<User> {
    throw new Error("Method not implemented.");
  }
  create(_data: Partial<User>): Promise<User> {
    throw new Error("Method not implemented.");
  }
  update(_id: number, data: Partial<User>): Promise<User> {
    throw new Error("Method not implemented.");
  }
}
