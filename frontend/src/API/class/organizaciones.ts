import { Crud, PaginatedResponse } from "../service";
import { DonationResponsePanel } from "../types/donaciones/donaciones";
import {
  Organizacion,
  OrganizacionCreateRequest,
  OrganizacionUpdateRequest,
} from "../types/organizaciones";
import { UpdateCredentialsPayload } from "../types/panelUsuario/updateCredenciales";

export class OrganizacionesService extends Crud<Organizacion> {
  protected endPoint = "organizations";

  async getAll(): Promise<Organizacion[]> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) throw new Error("Error al obtener organizaciones");

    return res.json();
  }

  async getAllPaginated(
    page = 1,
    limit = 10,
    search = "",
    includeDisabled = true
  ): Promise<PaginatedResponse<Organizacion>> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/list/paginated?page=${page}&limit=${limit}&search=${search}&includeDisabled=${includeDisabled}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    );

    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al obtener organizaciones paginadas (${res.status}): ${errorDetails}`
      );
    }

    return res.json();
  }

  async getCampaignsPaginatedByOrganizacion(
    organizacionId: number,
    page = 1,
    limit = 10
  ) {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/${organizacionId}/campaigns?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    );

    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al obtener campañas (${res.status}): ${errorDetails}`
      );
    }

    return res.json();
  }

  async getOne(id: number): Promise<Organizacion> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) throw new Error("Organización no encontrada");

    return res.json();
  }

  async create(data: OrganizacionCreateRequest): Promise<Organizacion> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al crear organización");

    return res.json();
  }

  async update(
    id: number,
    data: OrganizacionUpdateRequest
  ): Promise<Organizacion> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al actualizar organización");

    return res.json();
  }

  async updateCredentials(
    id: number,
    data: UpdateCredentialsPayload,
  ): Promise<{ user: Organizacion; token: string }> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/${id}/credenciales`,
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

    if (!res.ok) throw new Error("Error al deshabilitar organización");
  }

  async restore(id: number): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/${id}/restaurar`,
      {
        method: "PATCH",
        headers: this.getHeaders(),
      }
    );

    if (!res.ok) {
      const errorDetails = await res.text().catch(() => "");
      throw new Error(errorDetails || "Error al restaurar organización");
    }
  }

  async getOrganizationCampaignsPaginated(
    organizacionId: number,
    page = 1,
    limit = 10,
  ) {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/${organizacionId}/campaigns/paginated?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      },
    );
    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al obtener campañas de organización (${res.status}): ${errorDetails}`,
      );
    }
    return res.json();
  }
}
