import { createClient } from "@/lib/supabase/server";

export type TicketRow = {
  id: string;
  number: number;
  subject: string | null;
  status: "new" | "in_review" | "in_progress" | "waiting_customer" | "resolved" | "closed" | "rejected";
  priority: "low" | "normal" | "high" | "urgent";
  channel_id: string | null;
  contact_id: string | null;
  assignee_id: string | null;
  last_message_at: string | null;
  created_at: string;
  contact?: { id: string; full_name: string } | null;
  channel?: { id: string; type: string; name: string } | null;
};

export async function listTickets(orgId: string, status?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("tickets")
    .select(`
      id, number, subject, status, priority, channel_id, contact_id, assignee_id, last_message_at, created_at,
      contact:contacts(id, full_name),
      channel:channels(id, type, name)
    `)
    .eq("organization_id", orgId)
    .order("last_message_at", { ascending: false })
    .limit(200);

  if (status && status !== "all") q = q.eq("status", status);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as TicketRow[];
}

export async function listTicketsForContact(orgId: string, contactId: string): Promise<TicketRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select(`
      id, number, subject, status, priority, channel_id, contact_id, assignee_id, last_message_at, created_at,
      contact:contacts(id, full_name),
      channel:channels(id, type, name)
    `)
    .eq("organization_id", orgId)
    .eq("contact_id", contactId)
    .order("last_message_at", { ascending: false })
    .limit(20);
  return (data ?? []) as unknown as TicketRow[];
}

export async function listTicketsForDeal(orgId: string, dealId: string): Promise<TicketRow[]> {
  // Tickets no tienen FK directa a deals — los relacionamos por contacto del deal
  const supabase = await createClient();
  const { data: deal } = await supabase
    .from("deals")
    .select("contact_id")
    .eq("id", dealId)
    .eq("organization_id", orgId)
    .single();
  if (!deal?.contact_id) return [];
  return listTicketsForContact(orgId, deal.contact_id);
}

export async function getTicket(orgId: string, id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select(`
      *,
      contact:contacts(id, full_name, email, phone, whatsapp),
      channel:channels(id, type, name)
    `)
    .eq("organization_id", orgId)
    .eq("id", id)
    .single();
  return data;
}

export async function listTicketMessages(ticketId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ticket_messages")
    .select("id, sender_type, sender_id, body, is_internal, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  return data ?? [];
}
