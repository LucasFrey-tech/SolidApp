import { z } from "zod";

/* ================== SCHEMAS ================== */

export const usuarioSchema = z.object({
  nombre: z.string(),
  correo: z.string().email(),
  clave: z.string(),
});

export const empresaSchema = z.object({
  razonSocial: z.string(),
  cuit: z.string(),
  correo: z.string().email(),
});

export const organizacionSchema = z.object({
  nombre: z.string(),
  tipo: z.string(),
  correo: z.string().email(),
});

/* ================== TIPOS ================== */

export type UsuarioData = z.infer<typeof usuarioSchema>;
export type EmpresaData = z.infer<typeof empresaSchema>;
export type OrganizacionData = z.infer<typeof organizacionSchema>;

export type FormType = "usuario" | "empresa" | "organizacion";
