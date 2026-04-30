import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  full_name: string | null;
  default_org_id: string | null;
};

export type CurrentOrg = {
  id: string;
  name: string;
  slug: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, default_org_id")
    .eq("id", user.id)
    .single();

  return profile ?? {
    id: user.id,
    email: user.email!,
    full_name: null,
    default_org_id: null,
  };
}

export async function getCurrentOrg(): Promise<CurrentOrg | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Toma la primera membership disponible (más adelante: selector de org)
  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, organizations(id, name, slug)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership?.organizations) return null;
  const org = membership.organizations as unknown as CurrentOrg;
  return { id: org.id, name: org.name, slug: org.slug };
}
