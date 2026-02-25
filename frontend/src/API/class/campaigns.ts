import { Crud, PaginatedResponse } from "../service";
import { Campaign, CampaignDetalle } from "../types/campañas/campaigns";

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
  ): Promise<PaginatedResponse<Campaign>> {
    let url = `${this.baseUrl}${this.endPoint}/list/paginated/?page=${page}&limit=${limit}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
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
