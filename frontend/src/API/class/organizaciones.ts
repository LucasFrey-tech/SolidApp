import { Crud, PaginatedResponse } from '../service';
import {
  Organizacion,
  OrganizacionCreateRequest,
  OrganizacionUpdateRequest,
  OrganizacionSummary,
  OrganizacionImagen,
} from '../types/organizaciones';

export class OrganizacionesService extends Crud<Organizacion> {
  protected endpoint = '/organizations';

  constructor(token?: string) {
    super(token);
  }

  async getAll(): Promise<Organizacion[]> {
    const res = await fetch(`${this.baseUrl}${this.endpoint}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error('Error al obtener organizaciones');
    }

    return res.json();
  }

  async getAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Organizacion>> {
    const res = await fetch(
      `${this.baseUrl}${this.endpoint}?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      throw new Error('Error al obtener organizaciones paginadas');
    }

    return res.json();
  }

  async getOne(id: number): Promise<Organizacion> {
    const res = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error('Organización no encontrada');
    }

    return res.json();
  }

  async create(data: OrganizacionCreateRequest): Promise<Organizacion> {
    const res = await fetch(`${this.baseUrl}${this.endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Error al crear organización');
    }

    return res.json();
  }

  async update(
    id: number,
    data: OrganizacionUpdateRequest,
  ): Promise<Organizacion> {
    const res = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Error al actualizar organización');
    }

    return res.json();
  }

  async delete(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error('Error al deshabilitar organización');
    }
  }

  async restore(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}${this.endpoint}/${id}/restore`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error('Error al restaurar organización');
    }
  }

  async getImages(): Promise<OrganizacionImagen[]> {
    const res = await fetch(`${this.baseUrl}${this.endpoint}/imagenes`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error('Error al obtener imágenes de organizaciones');
    }

    return res.json();
  }

  async getSummaries(): Promise<OrganizacionSummary[]> {
    const res = await fetch(`${this.baseUrl}${this.endpoint}/summary`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error('Error al obtener resumen de organizaciones');
    }

    return res.json();
  }

  async getCampaigns(organizacionId: number): Promise<any[]> {
    const res = await fetch(
      `${this.baseUrl}${this.endpoint}/${organizacionId}/campaigns`,
      {
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      throw new Error('Error al obtener campañas de la organización');
    }

    return res.json();
  }
}