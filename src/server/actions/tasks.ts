"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { taskSchema, type TaskInput } from "@/lib/validations/task";
import { getCurrentOrg } from "@/server/queries/me";

function clean(input: TaskInput) {
  return {
    title: input.title,
    description: input.description || null,
    status: input.status,
    priority: input.priority,
    due_at: input.due_at ? new Date(input.due_at).toISOString() : null,
    assignee_id: input.assignee_id || null,
    related_type: input.related_type || null,
    related_id: input.related_id || null,
  };
}

export async function createTaskAction(input: TaskInput) {
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const payload = {
    ...clean(parsed.data),
    organization_id: org.id,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Audit log de "created" lo escribe el trigger SQL automáticamente (mig 0008).

  // Notificar al asignado (si no es el mismo creador)
  if (parsed.data.assignee_id && parsed.data.assignee_id !== user.id) {
    await supabase.from("notifications").insert({
      organization_id: org.id,
      user_id: parsed.data.assignee_id,
      title: "Nueva tarea asignada",
      body: parsed.data.title,
      link_url: `/tasks/${data.id}`,
    });
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (parsed.data.related_type === "contact" && parsed.data.related_id) {
    revalidatePath(`/contacts/${parsed.data.related_id}`);
  }
  return { ok: true, id: data.id };
}

export async function updateTaskAction(id: string, input: TaskInput) {
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const update = clean(parsed.data);
  const completed_at =
    parsed.data.status === "done" ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("tasks")
    .update({ ...update, completed_at })
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  // Audit log de "updated" lo escribe el trigger SQL automáticamente (mig 0008).

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function toggleTaskDoneAction(id: string, done: boolean) {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("tasks")
    .update({
      status: done ? "done" : "open",
      completed_at: done ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: done ? "completed" : "reopened",
    entity_type: "task",
    entity_id: id,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteTaskAction(id: string) {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  // Audit log de "deleted" lo escribe el trigger SQL automáticamente (mig 0008).

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks");
}
