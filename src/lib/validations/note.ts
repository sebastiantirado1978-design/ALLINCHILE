import { z } from "zod";

export const noteSchema = z.object({
  body: z.string().min(1, "La nota no puede estar vacía").max(10000),
  related_type: z.enum(["contact", "company", "deal", "ticket", "task"]),
  related_id: z.string().uuid(),
});
export type NoteInput = z.infer<typeof noteSchema>;
