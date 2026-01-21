import { Crud, PaginatedResponse } from '../service';
import {
  Empresa,
  EmpresaCreateRequest,
  EmpresaUpdateRequest,
  EmpresaSummary,
  EmpresaImagen,
} from '../types/empresas';

export class EmpresasService extends Crud<Empresa> {
  protected endpoint = '/empresas';

  constructor(token?: string) {
    super(token);
  }

  async getAll(): Promise<Empresa[]> {
    const res = await fetch(`${this.baseUrl}${this.endpoint}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error('Error al obtener empresas');
    }

    return res.json();
  }

  async getAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Empresa>> {
    const res = await fetch(
      `${this.baseUrl}${this.endpoint}?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      throw new Error('Error al obtener empresas paginadas');
    }

    return res.json();
  }

  async getImages(): Promise<EmpresaImagen[]> {
    const resQuery = await fetch(
      `${this.baseUrl}${this.endpoint}/imagenes`,
      {
        headers: this.getHeaders(),
      },
    );
    
    if (!resQuery.ok) {
      throw new Error('Error al obtener imágenes de empresas');
    }

    const res = await resQuery.json();
    return res;
  }

  async getOne(id: number): Promise<Empresa> {
    const res = await fetch(
      `${this.baseUrl}${this.endpoint}/${id}`,
      {
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      throw new Error('Empresa no encontrada');
    }

    return res.json();
  }

  async create(
    data: EmpresaCreateRequest,
  ): Promise<Empresa> {
    const res = await fetch(`${this.baseUrl}${this.endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Error al crear empresa');
    }

    return res.json();
  }

  async update(
    id: number,
    data: EmpresaUpdateRequest,
  ): Promise<Empresa> {
    const res = await fetch(
      `${this.baseUrl}${this.endpoint}/${id}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      },
    );

    if (!res.ok) {
      throw new Error('Error al actualizar empresa');
    }

    return res.json();
  }

  async delete(id: number): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}${this.endpoint}/${id}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      throw new Error('Error al deshabilitar empresa');
    }
  }

  /**
   * Restaurar empresa deshabilitada
   */
  async restore(id: number): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}${this.endpoint}/${id}/restore`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      throw new Error('Error al restaurar empresa');
    }
  }

  /**
   * (Opcional) Obtener resumen de empresas
   * Solo si el backend expone /empresas/summary
   */
  async getSummaries(): Promise<EmpresaSummary[]> {
    const res = await fetch(
      `${this.baseUrl}${this.endpoint}/summary`,
      {
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      throw new Error('Error al obtener resumen de empresas');
    }

    return res.json();
  }
}
