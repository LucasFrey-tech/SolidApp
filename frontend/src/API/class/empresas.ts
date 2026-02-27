import { Crud, PaginatedResponse } from "../service";
import { Beneficio, BeneficioCreateRequest, BeneficioUpdateRequest } from "../types/beneficios";
import { Empresa, EmpresaUpdateRequest } from "../types/empresas";
import { UpdateCredencialesPayload } from "../types/panelUsuario/updateCredenciales";

export class EmpresasService extends Crud<Empresa> {
  protected endPoint = "empresas";
  
  // =====Panel Empresa=====
  
  async getPerfil(): Promise<Empresa> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/perfil`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Error al obtener perfil (${res.status})`);
    return res.json();
  }
  
  /**
   *  Beneficios paginados por empresa
  */
 async getCuponesPaginated(
   page: number,
   limit: number,
  ): Promise<PaginatedResponse<Beneficio>> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/cupones?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      },
    );
    
    if (!res.ok) {
      throw new Error("Error al obtener beneficios paginados por empresa");
    }
    
    return res.json();
  }
  
  async createCupon(data: BeneficioCreateRequest,): Promise<Beneficio> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/cupones`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Error al crear cupón (${res.status})`);
    return res.json();
  }
  
  async updateCupon(
    cuponId: number,
    data: BeneficioUpdateRequest,
  ): Promise<Beneficio> {
    const res = await fetch(
      `${this.baseUrl}/${this.endPoint}/cupones/${cuponId}`,
      {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      },
    );
    if (!res.ok) throw new Error(`Error al actualizar cupón (${res.status})`);
    return res.json();
  }

  async updatePerfil(
    data: EmpresaUpdateRequest,
    file?: File | null,
  ): Promise<Empresa> {
    const headers = this.getHeaders();
    const formData = new FormData();
    
    formData.append("data", JSON.stringify(data));
    
    if (file) {
      formData.append("logo", file);
    }
    
    delete headers["Content-Type"];
    
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/perfil`, {
      method: "PATCH",
      headers,
      body: formData,
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
  
  // =====Panel Admin=====
  
  async getAll(): Promise<Empresa[]> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}`, {
      headers: this.getHeaders(),
    });
    
    if (!res.ok) {
      throw new Error("Error al obtener empresas");
    }
    
    return res.json();
  }
  
  async getAllPaginated(
    page = 1,
    limit = 10,
    search?: string,
    onlyEnabled?: boolean,
  ): Promise<PaginatedResponse<Empresa>> {
    let url = `${this.baseUrl}/${this.endPoint}/list?page=${page}&limit=${limit}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    url += `&onlyEnabled=${onlyEnabled}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Error al obtener usuarios paginados (${res.status}): ${errorDetails}`,
      );
    }
    return res.json();
  }
  
  async getOne(id: number): Promise<Empresa> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}`, {
      headers: this.getHeaders(),
    });
    
    if (!res.ok) {
      throw new Error("Empresa no encontrada");
    }
    
    return res.json();
  }
  
  async delete(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}/borrar`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al deshabilitar empresa");
    }
  }
  
  /**
   * Restaurar empresa deshabilitada
  */
 async restore(id: number): Promise<void> {
   const res = await fetch(`${this.baseUrl}/${this.endPoint}/${id}/restaurar`, {
     method: "PATCH",
     headers: this.getHeaders(),
    });
    
    if (!res.ok) {
      throw new Error("Error al restaurar empresa");
    }
  }
  
  

  create(_data: Partial<Empresa>): Promise<Empresa> {
    throw new Error("Method not implemented.");
  }

  update(_id: number, data: Partial<Empresa>): Promise<Empresa> {
    throw new Error("Method not implemented.");
  }
}
