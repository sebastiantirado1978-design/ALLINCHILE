"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dealSchema, type DealInput } from "@/lib/validations/deal";
import { getCurrentOrg } from "@/server/queries/me";

function toPayload(input: DealInput) {
  return {
    title: input.title,
    description: input.description || null,
    pipeline_id: input.pipeline_id,
    stage_id: input.stage_id,
    contact_id: input.contact_id || null,
    owner_id: input.owner_id || null,
    value_amount: input.value_amount,
    currency: input.currency || "CLP",
    expected_close_date: input.expected_close_date || null,
    next_action: input.next_action || null,
    next_action_at: input.next_action_at ? new Date(input.next_action_at).toISOString() : null,
  };
}

export async function createDealAction(input: DealInput) {
  const parsed = dealSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("deals")
    .insert({
      ...toPayload(parsed.data),
      organization_id: org.id,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: "created",
    entity_type: "deal",
    entity_id: data.id,
  });

  revalidatePath("/deals");
  revalidatePath("/dashboard");
  return { ok: true, id: data.id };
}

export async function updateDealAction(id: string, input: DealInput) {
  const parsed = dealSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("deals")
    .update(toPayload(parsed.data))
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: "updated",
    entity_type: "deal",
    entity_id: id,
  });

  revalidatePath("/deals");
  revalidatePath(`/deals/${id}`);
  return { ok: true };
}

export async function moveDealToStageAction(dealId: string, stageId: string) {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: stage } = await supabase
    .from("pipeline_stages")
    .select("id, name, is_won, is_lost")
    .eq("id", stageId)
    .eq("organization_id", org.id)
    .single();

  if (!stage) return { error: "Etapa no encontrada" };

  const update: Record<string, unknown> = {
    stage_id: stageId,
    is_won: stage.is_won,
    is_lost: stage.is_lost,
    closed_at: stage.is_won || stage.is_lost ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from("deals")
    .update(update)
    .eq("id", dealId)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: stage.is_won ? "deal_won" : stage.is_lost ? "deal_lost" : "stage_changed",
    entity_type: "deal",
    entity_id: dealId,
    changes: { stage_id: stageId, stage_name: stage.name },
  });

  revalidatePath("/deals");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteDealAction(id: string) {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: "deleted",
    entity_type: "deal",
    entity_id: id,
  });

  revalidatePath("/deals");
  redirect("/deals");
}
