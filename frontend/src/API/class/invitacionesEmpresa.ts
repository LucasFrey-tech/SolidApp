import { Invitacion, InvitacionCrearResponse } from "../types/invitaciones/invitaciones";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface InvitacionesResponse {
  items: Invitacion[];
  total: number;
}

export class InvitacionesEmpresaService {

  async getInvitaciones(
    empresaId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<InvitacionesResponse> {

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_URL}/invitaciones/empresa/${empresaId}?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("ERROR BACKEND:", text);
      throw new Error("Error al obtener invitaciones de empresa");
    }

    return res.json();
  }

  async crearInvitaciones(
    empresaId: number,
    correos: string[]
  ): Promise<InvitacionCrearResponse> {

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_URL}/invitaciones/empresa/${empresaId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ correos }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("ERROR BACKEND:", text);
      throw new Error("Error al crear invitaciones de empresa");
    }

    return res.json();
  }
}