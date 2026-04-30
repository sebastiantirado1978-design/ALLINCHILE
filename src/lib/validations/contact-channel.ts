import { z } from "zod";
import { channelTypeValues } from "./ticket";

export const contactChannelSchema = z.object({
  channel: z.enum(channelTypeValues),
  identifier: z.string().min(2, "Identificador requerido"),
  is_primary: z.boolean().default(false),
});
export type ContactChannelInput = z.infer<typeof contactChannelSchema>;
