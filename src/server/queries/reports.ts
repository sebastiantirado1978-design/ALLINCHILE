import { createClient } from "@/lib/supabase/server";

export async function getReportsData(orgId: string) {
  const supabase = await createClient();

  const [
    contactsByStatus,
    ticketsByStatus,
    ticketsByChannel,
    dealsByStage,
    tasksByAssignee,
    activityLast14Days,
  ] = await Promise.all([
    // Contactos por estado
    supabase.from("contacts").select("status").eq("organization_id", orgId),
    // Tickets por estado
    supabase.from("tickets").select("status").eq("organization_id", orgId),
    // Tickets por canal
    supabase
      .from("tickets")
      .select("channel:channels(type)")
      .eq("organization_id", orgId),
    // Deals por etapa
    supabase
      .from("deals")
      .select("stage_id, value_amount, stage:pipeline_stages(name, color)")
      .eq("organization_id", orgId)
      .eq("is_won", false)
      .eq("is_lost", false),
    // Tareas por responsable
    supabase
      .from("tasks")
      .select("assignee_id, status, profile:profiles!tasks_assignee_id_fkey(full_name, email)")
      .eq("organization_id", orgId)
      .in("status", ["open", "in_progress"]),
    // Actividad últimos 14 días (audit logs)
    supabase
      .from("audit_logs")
      .select("created_at, action")
      .eq("organization_id", orgId)
      .gte("created_at", new Date(Date.now() - 14 * 86400000).toISOString())
      .order("created_at", { ascending: true }),
  ]);

  // Agrupar contactos por estado
  const contactStatusCounts: Record<string, number> = {};
  for (const c of contactsByStatus.data ?? []) {
    contactStatusCounts[c.status] = (contactStatusCounts[c.status] ?? 0) + 1;
  }

  // Tickets por estado
  const ticketStatusCounts: Record<string, number> = {};
  for (const t of ticketsByStatus.data ?? []) {
    ticketStatusCounts[t.status] = (ticketStatusCounts[t.status] ?? 0) + 1;
  }

  // Tickets por canal
  type TicketChannelRow = { channel: { type: string } | null };
  const ticketChannelCounts: Record<string, number> = {};
  for (const t of (ticketsByChannel.data ?? []) as unknown as TicketChannelRow[]) {
    const type = t.channel?.type ?? "sin canal";
    ticketChannelCounts[type] = (ticketChannelCounts[type] ?? 0) + 1;
  }

  // Deals por etapa con valor
  type DealRow = {
    stage_id: string;
    value_amount: number | null;
    stage: { name: string; color: string } | null;
  };
  const stageMap: Record<string, { name: string; color: string; count: number; value: number }> = {};
  for (const d of (dealsByStage.data ?? []) as unknown as DealRow[]) {
    const key = d.stage_id;
    if (!stageMap[key]) {
      stageMap[key] = {
        name: d.stage?.name ?? "Sin etapa",
        color: d.stage?.color ?? "#64748B",
        count: 0,
        value: 0,
      };
    }
    stageMap[key].count++;
    stageMap[key].value += Number(d.value_amount ?? 0);
  }
  const dealsStageData = Object.values(stageMap);

  // Tareas por responsable
  type TaskRow = {
    assignee_id: string | null;
    status: string;
    profile: { full_name: string | null; email: string } | null;
  };
  const assigneeMap: Record<string, { name: string; count: number }> = {};
  for (const t of (tasksByAssignee.data ?? []) as unknown as TaskRow[]) {
    const key = t.assignee_id ?? "unassigned";
    const name = t.profile?.full_name ?? t.profile?.email ?? "Sin asignar";
    if (!assigneeMap[key]) assigneeMap[key] = { name, count: 0 };
    assigneeMap[key].count++;
  }
  const tasksAssigneeData = Object.values(assigneeMap);

  // Actividad últimos 14 días
  const activityByDay: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    activityByDay[key] = 0;
  }
  for (const a of activityLast14Days.data ?? []) {
    const key = a.created_at.slice(0, 10);
    if (key in activityByDay) activityByDay[key]++;
  }
  const activityData = Object.entries(activityByDay).map(([date, count]) => ({
    date: date.slice(5), // MM-DD
    count,
  }));

  return {
    contactStatusCounts,
    ticketStatusCounts,
    ticketChannelCounts,
    dealsStageData,
    tasksAssigneeData,
    activityData,
    totals: {
      contacts: contactsByStatus.data?.length ?? 0,
      tickets: ticketsByStatus.data?.length ?? 0,
      activeDeals: dealsByStage.data?.length ?? 0,
      activeDealsValue: dealsStageData.reduce((s, d) => s + d.value, 0),
    },
  };
}
