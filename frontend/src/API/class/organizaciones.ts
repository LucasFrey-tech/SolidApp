import { Crud, PaginatedResponse } from "../service";
import {
  Campaign,
  CampaignCreateRequest,
  CampaignDetalle,
  CampaignUpdateRequest,
} from "../types/campañas/campaigns";
import { DonacionResponsePanel } from "../types/donaciones/donaciones";
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

  async getCampaignsPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<CampaignDetalle>> {
    console.log("headers:", this.getHeaders());
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/campanas/?page=${page}&limit=${limit}`,
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

  async getDonacionesPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<DonacionResponsePanel>> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/donaciones/?page=${page}&limit=${limit}`,
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

  async createCampaign(
    data: CampaignCreateRequest,
    files?: File[],
  ): Promise<Campaign> {
    const formData = new FormData();

    formData.append("titulo", data.titulo);
    formData.append("descripcion", data.descripcion);
    formData.append("fecha_Inicio", data.fecha_Inicio);
    formData.append("fecha_Fin", data.fecha_Fin);
    formData.append("objetivo", data.objetivo.toString());
    formData.append("puntos", data.puntos.toString());

    if (data.estado) {
      formData.append("estado", data.estado);
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const headers = this.getHeaders();
    delete headers["Content-Type"];

    const res = await fetch(`${this.baseUrl}/${this.endPoint}/campana`, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!res.ok) {
      console.error("STATUS:", res.status);
      try {
        const errorData = await res.json();
        console.error(
          "BACKEND ERROR (json):",
          JSON.stringify(errorData, null, 2),
        );
      } catch (e) {
        const text = await res.text();
        console.error("BACKEND ERROR (text):", text);
      }
      throw new Error("Error al crear campaña");
    }

    return res.json();
  }

  async updateCampaign(
    id: number,
    data: CampaignUpdateRequest,
    files?: File[],
    imagenesExistentes?: string[],
  ): Promise<Campaign> {
    const formData = new FormData();

    const stringFields: (keyof CampaignUpdateRequest)[] = [
      "titulo",
      "descripcion",
      "fecha_Inicio",
      "fecha_Fin",
      "estado",
    ];

    const numberFields: (keyof CampaignUpdateRequest)[] = [
      "objetivo",
      "puntos",
    ];

    stringFields.forEach((key) => {
      const value = data[key];
      if (value !== undefined) {
        formData.append(key, value as string);
      }
    });

    numberFields.forEach((key) => {
      const value = data[key];
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    files?.forEach((file) => formData.append("files", file));

    if (imagenesExistentes && imagenesExistentes.length > 0) {
      imagenesExistentes.forEach((url) =>
        formData.append("imagenesExistentes", url)
      );
    } else {
      formData.append("imagenesExistentes", "");
    }

    const headers = this.getHeaders();
    delete headers["Content-Type"];

    const res = await fetch(`${this.baseUrl}/${this.endPoint}/campana`, {
      method: "PATCH",
      headers,
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Error al actualizar campaña");
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
