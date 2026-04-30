import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con service_role. Bypass RLS.
 * Usar SOLO en server actions para operaciones que necesitan privilegios
 * elevados (bootstrap de signup, gestión de invitaciones, etc.).
 * NUNCA exponer al cliente.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
