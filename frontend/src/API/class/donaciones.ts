import type { Donation, DonacionImagen } from "@/API/types/donaciones";
import { Crud, PaginatedResponse } from "../service";

export class DonationsService extends Crud<Donation> {

  protected endPoint = '/empresas';

  constructor(token?: string) {
    super(token);
  }

  async getAll(): Promise<Donation[]> {
    const res = await fetch(`${this.baseUrl}/donations`, {
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
    const res = await fetch(`${this.baseUrl}/donations/${id}`, {
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
    const resQuery = await fetch(
      `${this.baseUrl}${this.endPoint}/imagenes`,
      {
        headers: this.getHeaders(),
      },
    );
    
    if (!resQuery.ok) {
      throw new Error('Error al obtener imágenes de donaciones');
    }

    const res = await resQuery.json();
    return res;
  }

  getAllPaginated(page?: number, limit?: number): Promise<PaginatedResponse<Donation>> {
    throw new Error("Method not implemented.");
  }
  getOne(_id: number): Promise<Donation> {
    throw new Error("Method not implemented.");
  }
  create(_data: Partial<Donation>): Promise<Donation> {
    throw new Error("Method not implemented.");
  }
  update(_id: number, data: Partial<Donation>): Promise<Donation> {
    throw new Error("Method not implemented.");
  }
  delete(_id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
