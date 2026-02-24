import { Crud, PaginatedResponse } from "../service";
import {
  Organizacion,
  OrganizacionCreateRequest,
  OrganizacionUpdateRequest,
} from "../types/organizaciones";
import { UpdateCredencialesPayload } from "../types/panelUsuario/updateCredenciales";

export class OrganizacionesService extends Crud<Organizacion> {
  protected endPoint = "organizaciones";

  // ===== Panel Organizacion =====

  async getPerfil(): Promise<Organizacion> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/perfil`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) throw new Error(`Error al obtener perfil (${res.status})`);

    return res.json();
  }

  async updatePerfil(data: OrganizacionUpdateRequest): Promise<Organizacion> {
    console.log("Datos que llegan al service del front:", data);

    const res = await fetch(`${this.baseUrl}/${this.endPoint}/perfil`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!res.ok) throw new Error(`Error al actualizar perfil (${res.status})`);
    
    return res.json();
  }
  
  async updateCredenciales(data: UpdateCredencialesPayload): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/credenciales`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorDetails = await res.text();
      
      throw new Error(
        `Error al actualizar credenciales (${res.status}): ${errorDetails}`,
      );
    }
  }
  
  async getCampaignsPaginatedByOrganizacion(
    organizacionId: number,
    page = 1,
    limit = 10,
  ) {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/${organizacionId}/campaigns?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al obtener campañas (${res.status}): ${errorDetails}`,
      );
    }

    return res.json();
  }

  // =====Panel Admin=====
  
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
  ): Promise<PaginatedResponse<Organizacion>> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/list?page=${page}&limit=${limit}&search=${search}`,
      { method: "GET", headers: this.getHeaders() },
    );

    if (!res.ok)
      throw new Error(
        `Error al obtener organizaciones paginadas (${res.status})`,
      );
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
    data: OrganizacionUpdateRequest,
  ): Promise<Organizacion> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar organización");
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
      },
    );

    if (!res.ok) {
      const errorDetails = await res.text().catch(() => "");
      throw new Error(errorDetails || "Error al restaurar organización");
    }
  }
}
