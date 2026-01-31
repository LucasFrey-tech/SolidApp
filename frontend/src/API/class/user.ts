import { Crud, PaginatedResponse } from "../service";
import { UpdateCredentialsPayload } from "../types/panelUsuario/updateCredenciales";
import { User, UserPoints } from "../types/user";

export class Users extends Crud<User> {
  private endPoint: string;
  constructor(token?: string) {
    super(token);
    this.endPoint = "users";
  }

  async getAllPaginated(
    page: number = 1,
    limit: number = 10,
    search: string = "",
  ): Promise<PaginatedResponse<User>> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/paginated?page=${page}&limit=${limit}&search=${search}`,
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

  async getAll(search: string = ""): Promise<User[]> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}?search=${search}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      },
    );
    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al obtener usuarios (${res.status}): ${errorDetails}`,
      );
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("Respuesta no es un arreglo de usuarios");
    }
    return data;
  }

  async getOne(id: number): Promise<User> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al obtener usuario (${res.status}): ${errorDetails}`,
      );
    }
    return res.json();
  }

  async getPoints(id: number): Promise<UserPoints> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/${id}/points`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    );

    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al obtener puntos (${res.status}): ${errorDetails}`
      );
    }

    return res.json();
  }

  async create(data: Partial<User>): Promise<User> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al crear usuario (${res.status}): ${errorDetails}`,
      );
    }
    return res.json();
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al actualizar usuario (${res.status}): ${errorDetails}`,
      );
    }
    return res.json();
  }

  async updateCredentials(id: number, data: UpdateCredentialsPayload): Promise<{ user: User; token: string }> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}/credentials`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    },
    );

    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al actualizar credenciales (${res.status}): ${errorDetails}`,
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
        `Error al eliminar usuario (${res.status}): ${errorDetails}`,
      );
    }
  }
}
