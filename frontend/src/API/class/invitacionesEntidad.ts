import { Invitacion, InvitacionCrearResponse } from "../types/invitaciones/invitaciones";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface InvitacionesResponse {
  items: Invitacion[];
  total: number;
}

export class InvitacionesEntidadService {
  async getInvitaciones(
    _entidadId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<InvitacionesResponse> {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${API_URL}/invitaciones/entidad?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("Error al obtener invitaciones de entidad");
    return res.json();
  }

  async crearInvitaciones(
    _entidadId: number,
    correos: string[]
  ): Promise<InvitacionCrearResponse> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/invitaciones/entidad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ correos }),
    });
    if (!res.ok) throw new Error("Error al crear invitaciones de entidad");
    return res.json();
  }
}