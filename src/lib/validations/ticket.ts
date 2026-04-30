import { z } from "zod";

export const ticketStatusValues = [
  "new",
  "in_review",
  "in_progress",
  "waiting_customer",
  "resolved",
  "closed",
  "rejected",
] as const;

export const ticketPriorityValues = ["low", "normal", "high", "urgent"] as const;

export const channelTypeValues = [
  "whatsapp",
  "email",
  "instagram",
  "facebook",
  "webchat",
  "phone",
  "sms",
  "linkedin",
  "twitter",
] as const;

export const ticketSchema = z.object({
  subject: z.string().min(2, "Asunto requerido"),
  status: z.enum(ticketStatusValues),
  priority: z.enum(ticketPriorityValues),
  contact_id: z.string().uuid().optional().or(z.literal("")),
  assignee_id: z.string().uuid().optional().or(z.literal("")),
  channel_type: z.enum(channelTypeValues).optional(),
  initial_message: z.string().optional(),
});
export type TicketInput = z.infer<typeof ticketSchema>;

export const messageSchema = z.object({
  body: z.string().min(1, "El mensaje no puede estar vacío"),
  is_internal: z.boolean().default(false),
});
export type MessageInput = z.infer<typeof messageSchema>;

export const ticketStatusLabels: Record<(typeof ticketStatusValues)[number], string> = {
  new: "Nuevo",
  in_review: "En revisión",
  in_progress: "En proceso",
  waiting_customer: "Esperando cliente",
  resolved: "Resuelto",
  closed: "Cerrado",
  rejected: "Rechazado",
};

export const channelLabels: Record<(typeof channelTypeValues)[number], string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  instagram: "Instagram",
  facebook: "Facebook",
  webchat: "Web chat",
  phone: "Teléfono",
  sms: "SMS",
  linkedin: "LinkedIn",
  twitter: "Twitter / X",
};
