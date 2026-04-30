"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/server/queries/me";

export async function markNotificationReadAction(id: string) {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("organization_id", org.id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function markAllNotificationsReadAction() {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("organization_id", org.id)
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Crea una notificación. Llamar desde otros server actions cuando ocurre algo
 * relevante para un usuario (asignación de ticket/tarea, mención, etc.).
 */
export async function createNotification(params: {
  organizationId: string;
  userId: string;
  title: string;
  body?: string;
  linkUrl?: string;
}) {
  const supabase = await createClient();
  await supabase.from("notifications").insert({
    organization_id: params.organizationId,
    user_id: params.userId,
    title: params.title,
    body: params.body ?? null,
    link_url: params.linkUrl ?? null,
  });
}
