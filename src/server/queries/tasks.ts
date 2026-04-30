import { createClient } from "@/lib/supabase/server";

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: "open" | "in_progress" | "done" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  due_at: string | null;
  completed_at: string | null;
  assignee_id: string | null;
  related_type: "contact" | "company" | "deal" | "ticket" | "task" | null;
  related_id: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskFilter = "all" | "mine" | "open" | "overdue" | "done";

export async function listTasks(orgId: string, filter: TaskFilter = "all") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let q = supabase
    .from("tasks")
    .select("*")
    .eq("organization_id", orgId)
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (filter === "mine" && user) q = q.eq("assignee_id", user.id);
  if (filter === "open") q = q.in("status", ["open", "in_progress"]);
  if (filter === "done") q = q.eq("status", "done");
  if (filter === "overdue") {
    q = q.in("status", ["open", "in_progress"]).lt("due_at", new Date().toISOString());
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as TaskRow[];
}

export async function getTask(orgId: string, id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("organization_id", orgId)
    .eq("id", id)
    .single();
  return (data ?? null) as TaskRow | null;
}

export async function listTasksFor(
  orgId: string,
  relatedType: TaskRow["related_type"],
  relatedId: string,
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("organization_id", orgId)
    .eq("related_type", relatedType)
    .eq("related_id", relatedId)
    .order("due_at", { ascending: true, nullsFirst: false });
  return (data ?? []) as TaskRow[];
}

export async function listOrgMembers(orgId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("user_id, role, profiles!inner(id, full_name, email)")
    .eq("organization_id", orgId);
  type Row = {
    user_id: string;
    role: string;
    profiles: { id: string; full_name: string | null; email: string };
  };
  const rows = (data ?? []) as unknown as Row[];
  return rows.map((m) => ({
    id: m.user_id,
    full_name: m.profiles.full_name,
    email: m.profiles.email,
    role: m.role,
  }));
}
