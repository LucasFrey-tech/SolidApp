import { Crud, PaginatedResponse } from "../service";
import {
  Beneficio,
  BeneficioCreateRequest,
  BeneficioUpdateEstadoRequest,
  BeneficioUpdateRequest,
} from "../types/beneficios";

export class BeneficiosService extends Crud<Beneficio> {
  protected endpoint = "beneficios";

  constructor(token?: string) {
    super(token);
  }

  async getAll(): Promise<Beneficio[]> {
    const res = await fetch(`${this.baseUrl}/${this.endpoint}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener beneficios");
    }

    return res.json();
  }

  async getAllPaginated(
    page = 1,
    limit = 10,
    search: string = "",
  ): Promise<PaginatedResponse<Beneficio>> {
    const res = await fetch(
      `${this.baseUrl}/${this.endpoint}/list/paginated?page=${page}&limit=${limit}&search=${search}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      },
    );
    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al obtener usuarios paginados (${res.status}): ${errorDetails}`,
      );
    }
    return res.json();
  }

  async getOne(id: number): Promise<Beneficio> {
    const res = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Beneficio no encontrado");
    }

    return res.json();
  }

  async create(data: BeneficioCreateRequest): Promise<Beneficio> {
    const res = await fetch(`${this.baseUrl}/${this.endpoint}`, {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al crear beneficio");
    }

    return res.json();
  }

  async canjear(
    beneficioId: number,
    data: { userId: number; cantidad: number },
  ) {
    const res = await fetch(
      `${this.baseUrl}/${this.endpoint}/${beneficioId}/canjear`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      },
    );

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    return res.json();
  }

  async update(id: number, data: any) {
    const res = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`, {
      method: "PATCH",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error("Error al canjear el beneficio");
    }

    return res.json();
  }

  async delete(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al eliminar beneficio");
    }
  }

  async updateEstado(
    id: number,
    body: BeneficioUpdateEstadoRequest,
  ) {
    const res = await fetch(
      `${this.baseUrl}/beneficios/${id}/estado`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      throw new Error('Error al actualizar estado del beneficio');
    }

    return res.json();
  }

  /**
   * Beneficios por empresa
   * GET /beneficios/empresa/:id
   */
  async getByEmpresa(idEmpresa: number): Promise<Beneficio[]> {
    const res = await fetch(
      `${this.baseUrl}/${this.endpoint}/empresa/${idEmpresa}`,
      {
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      throw new Error("Error al obtener beneficios por empresa");
    }

    return res.json();
  }

  /**
   *  Beneficios paginados por empresa
   *  GET /beneficios/empresa/:id
   */
  async getByEmpresaPaginated(
    idEmpresa: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<Beneficio>> {
    const res = await fetch(
      `${this.baseUrl}/${this.endpoint}/empresa/${idEmpresa}/paginated?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      },
    );

    if (!res.ok) {
      throw new Error("Error al obtener beneficios paginados por empresa");
    }

    return res.json();
  }

  /**
   * Beneficios generales (TIENDA)
   * GET /beneficios/general
   */
  async getGenerales(): Promise<Beneficio[]> {
    const res = await fetch(`${this.baseUrl}/${this.endpoint}/general`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener beneficios generales");
    }

    return res.json();
  }
}
