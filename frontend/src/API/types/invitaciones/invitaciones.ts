export type Invitacion = {
  id: number;
  correo: string;
  token: string;
  empresaId?: number;
  organizacionId?: number;
  invitadorID: number;
  rol: string;
  expirada: boolean;
  fecha_registro?: string;
  fecha_creacion: string;
  fecha_expiracion?: string;
  estado: "pendiente" | "expirada" | "usada";
};

export type InvitacionCrearResponse = {
  invitaciones: Invitacion[];
  correosExistentes: string[];
};