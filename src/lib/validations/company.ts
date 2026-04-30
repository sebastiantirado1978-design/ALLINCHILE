import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  size: z.string().optional(),
  country: z.string(),
  city: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});
export type CompanyInput = z.infer<typeof companySchema>;
