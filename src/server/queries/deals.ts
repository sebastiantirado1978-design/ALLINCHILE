import { createClient } from "@/lib/supabase/server";

export type Pipeline = {
  id: string;
  name: string;
  is_default: boolean;
};

export type Stage = {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  win_probability: number;
  is_won: boolean;
  is_lost: boolean;
  color: string;
};

export type DealRow = {
  id: string;
  title: string;
  description: string | null;
  pipeline_id: string;
  stage_id: string;
  contact_id: string | null;
  owner_id: string | null;
  value_amount: number;
  currency: string;
  expected_close_date: string | null;
  closed_at: string | null;
  is_won: boolean;
  is_lost: boolean;
  next_action: string | null;
  next_action_at: string | null;
  created_at: string;
  updated_at: string;
  contact?: { id: string; full_name: string } | null;
};

export async function listPipelines(orgId: string): Promise<Pipeline[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pipelines")
    .select("id, name, is_default")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Pipeline[];
}

export async function listStages(orgId: string, pipelineId?: string): Promise<Stage[]> {
  const supabase = await createClient();
  let q = supabase
    .from("pipeline_stages")
    .select("id, pipeline_id, name, position, win_probability, is_won, is_lost, color")
    .eq("organization_id", orgId)
    .order("position", { ascending: true });
  if (pipelineId) q = q.eq("pipeline_id", pipelineId);
  const { data } = await q;
  return (data ?? []) as Stage[];
}

export async function listDeals(orgId: string, pipelineId?: string): Promise<DealRow[]> {
  const supabase = await createClient();
  let q = supabase
    .from("deals")
    .select(`
      id, title, description, pipeline_id, stage_id, contact_id, owner_id,
      value_amount, currency, expected_close_date, closed_at, is_won, is_lost,
      next_action, next_action_at, created_at, updated_at,
      contact:contacts(id, full_name)
    `)
    .eq("organization_id", orgId)
    .order("updated_at", { ascending: false })
    .limit(500);
  if (pipelineId) q = q.eq("pipeline_id", pipelineId);
  const { data } = await q;
  return (data ?? []) as unknown as DealRow[];
}

export async function listDealsForContact(orgId: string, contactId: string): Promise<DealRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select(`
      id, title, description, pipeline_id, stage_id, contact_id, owner_id,
      value_amount, currency, expected_close_date, closed_at, is_won, is_lost,
      next_action, next_action_at, created_at, updated_at,
      contact:contacts(id, full_name)
    `)
    .eq("organization_id", orgId)
    .eq("contact_id", contactId)
    .order("updated_at", { ascending: false })
    .limit(20);
  return (data ?? []) as unknown as DealRow[];
}

export async function getDeal(orgId: string, id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select(`*, contact:contacts(id, full_name, email, whatsapp)`)
    .eq("organization_id", orgId)
    .eq("id", id)
    .single();
  return data;
}

export async function ensureDefaultPipeline(orgId: string): Promise<Pipeline> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("pipelines")
    .select("id, name, is_default")
    .eq("organization_id", orgId)
    .eq("is_default", true)
    .maybeSingle();
  if (existing) return existing as Pipeline;

  const { data: pipeline, error } = await supabase
    .from("pipelines")
    .insert({ organization_id: orgId, name: "Ventas", is_default: true })
    .select("id, name, is_default")
    .single();
  if (error || !pipeline) throw error ?? new Error("No se pudo crear pipeline");

  await supabase.from("pipeline_stages").insert([
    { organization_id: orgId, pipeline_id: pipeline.id, name: "Nuevo contacto", position: 0, win_probability: 5, color: "#94A3B8" },
    { organization_id: orgId, pipeline_id: pipeline.id, name: "Contactado", position: 1, win_probability: 15, color: "#60A5FA" },
    { organization_id: orgId, pipeline_id: pipeline.id, name: "Reunión agendada", position: 2, win_probability: 30, color: "#38BDF8" },
    { organization_id: orgId, pipeline_id: pipeline.id, name: "Propuesta enviada", position: 3, win_probability: 50, color: "#A78BFA" },
    { organization_id: orgId, pipeline_id: pipeline.id, name: "Negociación", position: 4, win_probability: 75, color: "#FBBF24" },
    { organization_id: orgId, pipeline_id: pipeline.id, name: "Ganado", position: 5, win_probability: 100, is_won: true, color: "#10B981" },
    { organization_id: orgId, pipeline_id: pipeline.id, name: "Perdido", position: 6, win_probability: 0, is_lost: true, color: "#EF4444" },
  ]);

  return pipeline as Pipeline;
}
