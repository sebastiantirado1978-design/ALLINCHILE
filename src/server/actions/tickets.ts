"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ticketSchema,
  messageSchema,
  type TicketInput,
  type MessageInput,
  ticketStatusValues,
} from "@/lib/validations/ticket";
import { getCurrentOrg } from "@/server/queries/me";

async function ensureChannel(orgId: string, type: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("channels")
    .select("id")
    .eq("organization_id", orgId)
    .eq("type", type)
    .eq("identifier", "default")
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("channels")
    .insert({
      organization_id: orgId,
      type,
      name: `${type} (default)`,
      identifier: "default",
      is_active: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

export async function createTicketAction(input: TicketInput) {
  const parsed = ticketSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  let channel_id: string | null = null;
  if (parsed.data.channel_type) {
    try {
      channel_id = await ensureChannel(org.id, parsed.data.channel_type);
    } catch {
      // continuar sin canal si falla
    }
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      organization_id: org.id,
      subject: parsed.data.subject,
      status: parsed.data.status,
      priority: parsed.data.priority,
      contact_id: parsed.data.contact_id || null,
      assignee_id: parsed.data.assignee_id || null,
      channel_id,
      created_by: user.id,
    })
    .select("id, number")
    .single();

  if (error) return { error: error.message };

  if (parsed.data.initial_message?.trim()) {
    await supabase.from("ticket_messages").insert({
      ticket_id: data.id,
      organization_id: org.id,
      sender_type: "agent",
      sender_id: user.id,
      body: parsed.data.initial_message,
      is_internal: false,
    });
  }

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: "created",
    entity_type: "ticket",
    entity_id: data.id,
  });

  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  return { ok: true, id: data.id, number: data.number };
}

export async function updateTicketStatusAction(
  id: string,
  status: (typeof ticketStatusValues)[number],
) {
  if (!ticketStatusValues.includes(status)) return { error: "Estado inválido" };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const update: Record<string, unknown> = { status };
  if (status === "resolved") update.resolved_at = new Date().toISOString();
  if (status === "closed") update.closed_at = new Date().toISOString();

  const { error } = await supabase
    .from("tickets")
    .update(update)
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: `status_changed_to_${status}`,
    entity_type: "ticket",
    entity_id: id,
  });

  revalidatePath("/inbox");
  revalidatePath(`/inbox/${id}`);
  return { ok: true };
}

export async function assignTicketAction(id: string, userId: string | null) {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Tomar el número del ticket para usarlo en la notificación
  const { data: ticket } = await supabase
    .from("tickets")
    .select("number, subject")
    .eq("id", id)
    .eq("organization_id", org.id)
    .single();

  const { error } = await supabase
    .from("tickets")
    .update({ assignee_id: userId })
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: userId ? "assigned" : "unassigned",
    entity_type: "ticket",
    entity_id: id,
    changes: { assignee_id: userId },
  });

  // Notificar al asignado (a menos que se asigne a sí mismo)
  if (userId && userId !== user.id && ticket) {
    await supabase.from("notifications").insert({
      organization_id: org.id,
      user_id: userId,
      title: `Te asignaron el ticket #${ticket.number}`,
      body: ticket.subject ?? "Sin asunto",
      link_url: `/inbox/${id}`,
    });
  }

  revalidatePath("/inbox");
  revalidatePath(`/inbox/${id}`);
  return { ok: true };
}

export async function postMessageAction(ticketId: string, input: MessageInput) {
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    organization_id: org.id,
    sender_type: "agent",
    sender_id: user.id,
    body: parsed.data.body,
    is_internal: parsed.data.is_internal,
  });

  if (error) return { error: error.message };

  revalidatePath(`/inbox/${ticketId}`);
  revalidatePath("/inbox");
  return { ok: true };
}

export async function deleteTicketAction(id: string) {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("tickets")
    .delete()
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: "deleted",
    entity_type: "ticket",
    entity_id: id,
  });

  revalidatePath("/inbox");
  redirect("/inbox");
}
