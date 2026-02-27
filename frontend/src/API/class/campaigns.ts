import { json } from "zod";
import { Crud, PaginatedResponse } from "../service";
import { Campaign, CampaignDetalle } from "../types/campañas/campaigns";
import { CampaignEstado } from "../types/campañas/enum";

export class campaignService extends Crud<Campaign> {
  protected endPoint = "/campaigns";

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
    search?: string,
    onlyEnabled: boolean = false,
  ): Promise<PaginatedResponse<Campaign>> {
    let url = `${this.baseUrl}${this.endPoint}/list/paginated/?page=${page}&limit=${limit}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    url += `&onlyEnabled=${onlyEnabled}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener organizaciones paginadas");
    }

    return res.json();
  }

  async getCampaignsPaginatedByOrganizacion(
    organizacionId: number,
    page = 1,
    limit = 10,
  ) {
    const res = await fetch(
      `${this.baseUrl}${this.endPoint}/organizacion/${organizacionId}?page=${page}&limit=${limit}`,
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

  async getOne(id: number): Promise<Campaign> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Campaña no encontrada");
    }

    return res.json();
  }

  async getOneDetail(id: number): Promise<CampaignDetalle> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}/${id}/detalle`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Detalle de campaña no encontrado");
    }

    return res.json();
  }

  async updateEstado(id: number, estado: CampaignEstado) {
    const res = await fetch(`${this.baseUrl}${this.endPoint}/${id}/estado`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({estado}),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar el estado de la campaña");
    }

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

  create(_data: Partial<Campaign>): Promise<Campaign> {
    throw new Error("Method not implemented.");
  }
  update(_id: number, data: Partial<Campaign>): Promise<Campaign> {
    throw new Error("Method not implemented.");
  }
}
