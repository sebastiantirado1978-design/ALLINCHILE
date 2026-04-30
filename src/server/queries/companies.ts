import { createClient } from "@/lib/supabase/server";

export type CompanyRow = {
  id: string;
  name: string;
  legal_name: string | null;
  tax_id: string | null;
  industry: string | null;
  website: string | null;
  size: string | null;
  country: string;
  city: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listCompanies(orgId: string, params?: { search?: string }) {
  const supabase = await createClient();
  let q = supabase
    .from("companies")
    .select("id, name, legal_name, tax_id, industry, website, size, country, city, address, notes, created_at, updated_at")
    .eq("organization_id", orgId)
    .order("name", { ascending: true })
    .limit(200);

  if (params?.search) {
    q = q.or(`name.ilike.%${params.search}%,tax_id.ilike.%${params.search}%`);
  }

  const { data } = await q;
  return (data ?? []) as CompanyRow[];
}

export async function getCompany(orgId: string, id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("organization_id", orgId)
    .eq("id", id)
    .single();
  return (data ?? null) as CompanyRow | null;
}

export async function listContactsByCompany(orgId: string, companyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("id, full_name, email, job_title, status")
    .eq("organization_id", orgId)
    .eq("company_id", companyId)
    .order("full_name", { ascending: true });
  return data ?? [];
}
