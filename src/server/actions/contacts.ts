"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { getCurrentOrg } from "@/server/queries/me";

export async function createContactAction(input: ContactInput) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const payload = {
    ...parsed.data,
    email: parsed.data.email || null,
    company_id: parsed.data.company_id || null,
    organization_id: org.id,
    created_by: user.id,
    owner_id: user.id,
  };

  const { data, error } = await supabase
    .from("contacts")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: "created",
    entity_type: "contact",
    entity_id: data.id,
  });

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  return { ok: true, id: data.id };
}

export async function updateContactAction(id: string, input: ContactInput) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("contacts")
    .update({
      ...parsed.data,
      email: parsed.data.email || null,
      company_id: parsed.data.company_id || null,
    })
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: "updated",
    entity_type: "contact",
    entity_id: id,
  });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  return { ok: true };
}

export async function deleteContactAction(id: string) {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: "deleted",
    entity_type: "contact",
    entity_id: id,
  });

  revalidatePath("/contacts");
  redirect("/contacts");
}
