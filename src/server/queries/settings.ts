import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getOrganization(orgId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url, primary_color, industry, country, timezone, settings")
    .eq("id", orgId)
    .single();
  return data;
}

export async function getMyRole(orgId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single();
  return (data?.role ?? null) as
    | "owner"
    | "admin"
    | "manager"
    | "agent"
    | "viewer"
    | null;
}

export async function listMembers(orgId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("id, role, user_id, profiles!inner(id, full_name, email, avatar_url)")
    .eq("organization_id", orgId)
    .order("role", { ascending: true });
  type Row = {
    id: string;
    role: "owner" | "admin" | "manager" | "agent" | "viewer";
    user_id: string;
    profiles: {
      id: string;
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    };
  };
  return (data ?? []) as unknown as Row[];
}

export async function listInvitations(orgId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invitations")
    .select("id, email, role, token, accepted_at, expires_at, created_at")
    .eq("organization_id", orgId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listTemplates(orgId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("message_templates")
    .select("id, title, body, shortcut, created_at, updated_at")
    .eq("organization_id", orgId)
    .order("title", { ascending: true });
  return data ?? [];
}

export async function getInvitationByToken(token: string) {
  // Service role: el token UUID ES el secret de la invitación. Cualquiera
  // que lo posee tiene derecho a ver los datos de la invitación. No
  // podemos pasar por RLS porque el invitado aún no es miembro de la org.
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("invitations")
    .select(`
      id, email, role, token, accepted_at, expires_at, organization_id,
      organization:organizations(id, name, slug)
    `)
    .eq("token", token)
    .single();
  return data;
}
