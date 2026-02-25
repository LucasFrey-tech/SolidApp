import type {
  Donation,
  DonacionImagen,
  CreateDonation,
  donacionUsuario,
  DonacionResponsePanel,
} from "@/API/types/donaciones/donaciones";
import { Crud, PaginatedResponse } from "../service";
import { DonacionEstado } from "../types/donaciones/enum";

export class DonacionesService extends Crud<Donation> {
  protected endPoint = "/donaciones";

  async create(data: CreateDonation): Promise<Donation> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}`, {
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

  async getAll(): Promise<Donation[]> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    return res.json();
  }

  async getById(id: number): Promise<Donation> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}/${id}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    return res.json();
  }

  async getImages(): Promise<DonacionImagen[]> {
    const resQuery = await fetch(`${this.baseUrl}${this.endPoint}/imagenes`, {
      headers: this.getHeaders(),
    });

    if (!resQuery.ok) {
      throw new Error("Error al obtener imágenes de donaciones");
    }

    const res = await resQuery.json();
    return res;
  }

  async getAllPaginated(
    page = 1,
    limit = 6,
  ): Promise<PaginatedResponse<Donation>> {
    return fetch(
      `${this.baseUrl}${this.endPoint}/paginated?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      },
    ).then(async (res) => {
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    });
  }

  async getAllPaginatedByOrganizacion(
    organizacionId: number,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<DonacionResponsePanel>> {
    const res = await fetch(
      `${this.baseUrl}${this.endPoint}/organizacion/${organizacionId}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    );

    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al obtener donaciones (${res.status}): ${errorDetails}`
      );
    }

    return res.json();
  }

  async updateDonationStatus(
    id: number,
    data: { estado: DonacionEstado; motivo?: string },
  ): Promise<DonacionEstado> {
    const res = await fetch(`${this.baseUrl}${this.endPoint}/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    return res.json();
  }

  getOne(_id: number): Promise<Donation> {
    throw new Error("Method not implemented.");
  }
  update(_id: number, data: Partial<Donation>): Promise<Donation> {
    throw new Error("Method not implemented.");
  }
  delete(_id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
