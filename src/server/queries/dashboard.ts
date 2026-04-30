import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  contactsTotal: number;
  companiesTotal: number;
  newRequests: number;
  openDeals: number;
  dealsTotal: number;
  pendingTasks: number;
  pipelineValue: number;
  overdueTasks: number;
};

export async function getDashboardStats(orgId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  const [
    contactsRes,
    companiesRes,
    ticketsRes,
    dealsRes,
    dealsTotalRes,
    tasksRes,
    pipelineRes,
    overdueRes,
  ] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("companies").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "new"),
    supabase.from("deals").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("is_won", false).eq("is_lost", false),
    supabase.from("deals").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "open"),
    supabase.from("deals").select("value_amount").eq("organization_id", orgId).eq("is_won", false).eq("is_lost", false),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "open").lt("due_at", new Date().toISOString()),
  ]);

  const pipelineValue =
    pipelineRes.data?.reduce((sum, d) => sum + Number(d.value_amount ?? 0), 0) ?? 0;

  return {
    contactsTotal: contactsRes.count ?? 0,
    companiesTotal: companiesRes.count ?? 0,
    newRequests: ticketsRes.count ?? 0,
    openDeals: dealsRes.count ?? 0,
    dealsTotal: dealsTotalRes.count ?? 0,
    pendingTasks: tasksRes.count ?? 0,
    pipelineValue,
    overdueTasks: overdueRes.count ?? 0,
  };
}

export async function getRecentActivity(orgId: string, limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, created_at, actor_id")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
