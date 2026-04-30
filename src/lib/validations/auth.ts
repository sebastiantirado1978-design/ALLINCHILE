import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  full_name: z.string().min(2, "Ingresa tu nombre"),
  organization_name: z.string().optional(),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  invite_token: z.string().uuid().optional(),
});
export type SignupInput = z.infer<typeof signupSchema>;
