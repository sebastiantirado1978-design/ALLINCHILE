import { z } from "zod";

export const contactSchema = z.object({
  full_name: z.string().min(2, "Nombre requerido"),
  job_title: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(["lead", "active", "inactive", "churned"]),
  notes: z.string().optional(),
  company_id: z.string().uuid().optional().or(z.literal("")),
});
export type ContactInput = z.infer<typeof contactSchema>;
