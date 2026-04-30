import { z } from "zod";

export const taskStatusValues = ["open", "in_progress", "done", "cancelled"] as const;
export const taskPriorityValues = ["low", "normal", "high", "urgent"] as const;
export const taskRelatedTypeValues = ["contact", "company", "deal", "ticket", "task"] as const;

export const taskSchema = z.object({
  title: z.string().min(2, "Título requerido"),
  description: z.string().optional(),
  status: z.enum(taskStatusValues),
  priority: z.enum(taskPriorityValues),
  due_at: z.string().optional().or(z.literal("")),
  assignee_id: z.string().uuid().optional().or(z.literal("")),
  related_type: z.enum(taskRelatedTypeValues).optional(),
  related_id: z.string().uuid().optional().or(z.literal("")),
});
export type TaskInput = z.infer<typeof taskSchema>;
