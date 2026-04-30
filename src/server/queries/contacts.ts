import { createClient } from "@/lib/supabase/server";

export type ContactRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  job_title: string | null;
  city: string | null;
  status: "lead" | "active" | "inactive" | "churned";
  source: string | null;
  notes: string | null;
  last_interaction_at: string | null;
  created_at: string;
};

export async function listContacts(orgId: string, params?: { search?: string; status?: string }) {
  const supabase = await createClient();
  let q = supabase
    .from("contacts")
    .select("id, full_name, email, phone, whatsapp, job_title, city, status, source, last_interaction_at, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (params?.search) {
    q = q.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
  }
  if (params?.status && params.status !== "all") {
    q = q.eq("status", params.status);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ContactRow[];
}

export async function getContact(orgId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("organization_id", orgId)
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function listContactChannels(orgId: string, contactId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_channels")
    .select("id, channel, identifier, is_primary, verified, created_at")
    .eq("organization_id", orgId)
    .eq("contact_id", contactId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function listAuditLogs(
  orgId: string,
  entityType: "contact" | "ticket" | "deal" | "task" | "company",
  entityId: string,
  limit = 20,
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, action, changes, created_at, actor_id, profiles:actor_id(full_name, email)")
    .eq("organization_id", orgId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(limit);
  type AuditRow = {
    id: string;
    action: string;
    changes: unknown;
    created_at: string;
    actor_id: string | null;
    profiles: { full_name: string | null; email: string } | null;
  };
  return (data ?? []) as unknown as AuditRow[];
}
