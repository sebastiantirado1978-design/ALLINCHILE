"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { companySchema, type CompanyInput } from "@/lib/validations/company";
import { getCurrentOrg } from "@/server/queries/me";

type Result = { ok?: boolean; error?: string; id?: string };

function clean(input: CompanyInput) {
  return {
    name: input.name,
    legal_name: input.legal_name || null,
    tax_id: input.tax_id || null,
    industry: input.industry || null,
    website: input.website || null,
    size: input.size || null,
    country: input.country,
    city: input.city || null,
    address: input.address || null,
    notes: input.notes || null,
  };
}

export async function createCompanyAction(input: CompanyInput): Promise<Result> {
  const parsed = companySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("companies")
    .insert({
      ...clean(parsed.data),
      organization_id: org.id,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Audit log de "created" lo escribe el trigger SQL automáticamente (mig 0008).

  revalidatePath("/companies");
  return { ok: true, id: data.id };
}

export async function updateCompanyAction(id: string, input: CompanyInput): Promise<Result> {
  const parsed = companySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("companies")
    .update(clean(parsed.data))
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  // Audit log de "updated" lo escribe el trigger SQL automáticamente (mig 0008).

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  return { ok: true };
}

export async function deleteCompanyAction(id: string): Promise<Result> {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  // Audit log de "deleted" lo escribe el trigger SQL automáticamente (mig 0008).

  revalidatePath("/companies");
  redirect("/companies");
}
