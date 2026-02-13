import { Crud, PaginatedResponse } from "../service";
import {
  Campaign,
  CampaignCreateRequest,
  CampaignDetalle,
  CampaignUpdateRequest,
} from "../types/campañas/campaigns";

export class campaignService extends Crud<Campaign> {
  protected endPoint = "/campaigns";

  constructor(token?: string) {
    super(token);
  }

  async getAll(): Promise<Campaign[]> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener campañas");
    }

    return res.json();
  }

  async getAllPaginated(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Campaign>> {
    const res = await fetch(
      `${this.baseUrl}${this.endPoint}/list/paginated/?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      throw new Error("Error al obtener organizaciones paginadas");
    }

    return res.json();
  }

  async getOne(id: number): Promise<Campaign> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}/${id}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Campaña no encontrada");
    }

    return res.json();
  }

  async getOneDetail(id: number): Promise<CampaignDetalle> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}/${id}/detalle`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Detalle de campaña no encontrado");
    }

    return res.json();
  }

  async create(data: CampaignCreateRequest): Promise<Campaign> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al crear campaña");
    }

    return res.json();
  }

  async update(id: number, data: CampaignUpdateRequest): Promise<Campaign> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar campaña");
    }

    return res.json();
  }

  async delete(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al eliminar la campaña");
    }
  }
}
