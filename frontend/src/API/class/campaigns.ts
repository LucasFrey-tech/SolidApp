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

  async create(data: CampaignCreateRequest, files?: File[]): Promise<Campaign> {
    const formData = new FormData();

    // Agregar los campos de datos
    formData.append('titulo', data.titulo);
    formData.append('descripcion', data.descripcion);
    formData.append('fecha_Inicio', data.fecha_Inicio);
    formData.append('fecha_Fin', data.fecha_Fin);
    formData.append('objetivo', data.objetivo.toString());
    formData.append('puntos', data.puntos.toString());
    formData.append('id_organizacion', data.id_organizacion.toString());

    if (data.estado) {
      formData.append('estado', data.estado);
    }

    // Agregar archivos si existen
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const headers = this.getHeaders();
    delete headers['Content-Type'];

    const res = await fetch(`${this.baseUrl}${this.endPoint}`, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!res.ok) {
      console.error("STATUS:", res.status);
      try {
        const errorData = await res.json();
        console.error("BACKEND ERROR (json):", JSON.stringify(errorData, null, 2));
      } catch (e) {
        const text = await res.text();
        console.error("BACKEND ERROR (text):", text);
      }
      throw new Error("Error al crear campaña");
    }

    return res.json();
  }

  async update(id: number, data: CampaignUpdateRequest, files?: File[]): Promise<Campaign> {
    const formData = new FormData();

    // Agregar los campos de datos solo si están definidos
    if (data.titulo !== undefined) {
      formData.append('titulo', data.titulo);
    }
    if (data.descripcion !== undefined) {
      formData.append('descripcion', data.descripcion);
    }
    if (data.fecha_Inicio !== undefined) {
      formData.append('fecha_Inicio', data.fecha_Inicio);
    }
    if (data.fecha_Fin !== undefined) {
      formData.append('fecha_Fin', data.fecha_Fin);
    }
    if (data.objetivo !== undefined) {
      formData.append('objetivo', data.objetivo.toString());
    }
    if (data.puntos !== undefined) {
      formData.append('puntos', data.puntos.toString());
    }
    if (data.estado !== undefined) {
      formData.append('estado', data.estado);
    }

    // Agregar archivos si existen
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    // IMPORTANTE: No incluir Content-Type en headers
    const headers = this.getHeaders();
    delete headers['Content-Type'];

    const res = await fetch(`${this.baseUrl}${this.endPoint}/${id}`, {
      method: "PUT",
      headers: headers,
      body: formData,
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
