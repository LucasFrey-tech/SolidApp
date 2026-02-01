import { Crud, PaginatedResponse } from "../service";
import {
  Organizacion,
  OrganizacionCreateRequest,
  OrganizacionUpdateRequest,
  OrganizacionSummary,
  OrganizacionImagen,
} from "../types/organizaciones";
import { UpdateCredentialsPayload } from "../types/panelUsuario/updateCredenciales";

export class OrganizacionesService extends Crud<Organizacion> {
  protected endPoint = "organizations";

  constructor(token?: string) {
    super(token);
  }

  async getAll(): Promise<Organizacion[]> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener organizaciones");
    }

    return res.json();
  }

  async getAllPaginated(
    page = 1,
    limit = 10,
    search: string = "",
  ): Promise<PaginatedResponse<Organizacion>> {
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

  async getOne(id: number): Promise<Organizacion> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Organización no encontrada");
    }

    return res.json();
  }

  async create(data: OrganizacionCreateRequest): Promise<Organizacion> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al crear organización");
    }

    return res.json();
  }

  async update(
    id: number,
    data: OrganizacionUpdateRequest,
  ): Promise<Organizacion> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar organización");
    }

    return res.json();
  }

  async updateCredentials(
    id: number,
    data: UpdateCredentialsPayload,
  ): Promise<{ user: Organizacion; token: string }> {
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
      throw new Error("Error al deshabilitar organización");
    }
  }

  async restore(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}/restore`, {
      method: "PATCH",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al restaurar organización");
    }
  }

  async getImages(): Promise<OrganizacionImagen[]> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/imagenes`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener imágenes de organizaciones");
    }

    return res.json();
  }

  async getSummaries(): Promise<OrganizacionSummary[]> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/summary`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener resumen de organizaciones");
    }

    return res.json();
  }

  async getCampaigns(organizacionId: number): Promise<any[]> {
    const res = await fetch(
      `${this.baseUrl}/campaigns/${organizacionId}/campaigns`,
      {
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      throw new Error("Error al obtener campañas de la organización");
    }

    return res.json();
  }

  async getCampaignsPaginated(
    page = 1,
    limit = 10,
    search: string = "",
  ) {
    const res = await fetch(
      `${this.baseUrl}/campaigns/list/paginated?page=${page}&limit=${limit}&search=${search}`,
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
}
