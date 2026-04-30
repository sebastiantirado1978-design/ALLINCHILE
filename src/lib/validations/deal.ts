import { z } from "zod";

export const dealSchema = z.object({
  title: z.string().min(2, "Título requerido"),
  description: z.string().optional(),
  pipeline_id: z.string().uuid("Selecciona un pipeline"),
  stage_id: z.string().uuid("Selecciona una etapa"),
  contact_id: z.string().uuid().optional().or(z.literal("")),
  owner_id: z.string().uuid().optional().or(z.literal("")),
  value_amount: z.number().min(0),
  currency: z.string(),
  expected_close_date: z.string().optional().or(z.literal("")),
  next_action: z.string().optional(),
  next_action_at: z.string().optional().or(z.literal("")),
});
export type DealInput = z.infer<typeof dealSchema>;

export const stageSchema = z.object({
  name: z.string().min(2),
  position: z.number().int().min(0),
  win_probability: z.coerce.number().min(0).max(100).default(0),
  is_won: z.boolean().default(false),
  is_lost: z.boolean().default(false),
  color: z.string().default("#64748B"),
});
export type StageInput = z.infer<typeof stageSchema>;
