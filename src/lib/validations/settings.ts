import { z } from "zod";

export const orgSettingsSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  industry: z.string().optional(),
  country: z.string(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color hex inválido (ej: #0EA5E9)"),
  logo_url: z.string().url().optional().or(z.literal("")),
});
export type OrgSettingsInput = z.infer<typeof orgSettingsSchema>;

export const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "manager", "agent", "viewer"]),
});
export type InviteInput = z.infer<typeof inviteSchema>;

export const templateSchema = z.object({
  title: z.string().min(2, "Título requerido"),
  body: z.string().min(2, "Cuerpo requerido"),
  shortcut: z
    .string()
    .regex(/^\/[a-z0-9_-]+$/i, "Atajo debe empezar con / y solo letras/números/-/_")
    .optional()
    .or(z.literal("")),
});
export type TemplateInput = z.infer<typeof templateSchema>;
