import { Crud, PaginatedResponse } from "../service";
import {
  Empresa,
  EmpresaCreateRequest,
  EmpresaUpdateRequest,
  EmpresaSummary,
  EmpresaImagen,
} from "../types/empresas";
import { UpdateCredentialsPayload } from "../types/panelUsuario/updateCredenciales";

export class EmpresasService extends Crud<Empresa> {
  protected endPoint = "empresas";

  constructor(token?: string) {
    super(token);
  }

  async getAll(): Promise<Empresa[]> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener empresas");
    }

    return res.json();
  }

  async getAllPaginated(
    page = 1,
    limit = 10,
    search: string = "",
  ): Promise<PaginatedResponse<Empresa>> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/list/paginated?page=${page}&limit=${limit}&search=${search}`,
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

  async getImages(): Promise<EmpresaImagen[]> {
    const resQuery = await fetch(`${this.baseUrl}/${this.endPoint}/imagenes`, {
      headers: this.getHeaders(),
    });

    if (!resQuery.ok) {
      throw new Error("Error al obtener imágenes de empresas");
    }

    const res = await resQuery.json();
    return res;
  }

  async getOne(id: number): Promise<Empresa> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Empresa no encontrada");
    }

    return res.json();
  }

  async create(data: EmpresaCreateRequest): Promise<Empresa> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al crear empresa");
    }

    return res.json();
  }

  async update(id: number, data: EmpresaUpdateRequest): Promise<Empresa> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar empresa");
    }

    return res.json();
  }

  async updateCredentials(
    id: number,
    data: UpdateCredentialsPayload,
  ): Promise<{ user: Empresa; token:string }> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/${id}/credentials`,
      {
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
      throw new Error("Error al deshabilitar empresa");
    }
  }

  /**
   * Restaurar empresa deshabilitada
   */
  async restore(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}/restore`, {
      method: "PATCH",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al restaurar empresa");
    }
  }

  /**
   * (Opcional) Obtener resumen de empresas
   * Solo si el backend expone /empresas/summary
   */
  async getSummaries(): Promise<EmpresaSummary[]> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/summary`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener resumen de empresas");
    }

    return res.json();
  }
}
