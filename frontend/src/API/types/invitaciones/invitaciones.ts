// types/invitacion.ts
export type Invitacion = {
  id: number;
  correo: string;
  token: string;
  empresaId?: number;
  organizacionId?: number;
  invitadorID: number;
  rol: string;
  usada: boolean;
  cancelada: boolean;
  fecha_creacion: string;
  fecha_expiracion?: string;
};

export type InvitacionConEstado = Invitacion & {
  estado: "Pendiente" | "Expirada" | "Aceptada";
};



