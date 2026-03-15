import { Invitacion } from "@/API/types/invitaciones/invitaciones";

export function getEstadoInvitacion(inv: Invitacion) {
  if (inv.usada) return "Aceptada";
  if (inv.cancelada) return "Expirada";
  return "Pendiente";
}