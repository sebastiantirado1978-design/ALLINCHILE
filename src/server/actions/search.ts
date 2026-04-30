"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/server/queries/me";

export type SearchHit = {
  type: "contact" | "company" | "ticket" | "deal" | "task";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
};

export async function globalSearchAction(query: string): Promise<SearchHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const org = await getCurrentOrg();
  if (!org) return [];

  const supabase = await createClient();
  const like = `%${q}%`;

  const [contacts, companies, tickets, deals, tasks] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, full_name, email")
      .eq("organization_id", org.id)
      .or(`full_name.ilike.${like},email.ilike.${like}`)
      .limit(5),
    supabase
      .from("companies")
      .select("id, name, tax_id")
      .eq("organization_id", org.id)
      .or(`name.ilike.${like},tax_id.ilike.${like}`)
      .limit(5),
    supabase
      .from("tickets")
      .select("id, number, subject, status")
      .eq("organization_id", org.id)
      .ilike("subject", like)
      .limit(5),
    supabase
      .from("deals")
      .select("id, title, value_amount, currency")
      .eq("organization_id", org.id)
      .ilike("title", like)
      .limit(5),
    supabase
      .from("tasks")
      .select("id, title, status")
      .eq("organization_id", org.id)
      .ilike("title", like)
      .limit(5),
  ]);

  const hits: SearchHit[] = [];

  for (const c of contacts.data ?? []) {
    hits.push({
      type: "contact",
      id: c.id,
      title: c.full_name,
      subtitle: c.email ?? undefined,
      href: `/contacts/${c.id}`,
    });
  }
  for (const co of companies.data ?? []) {
    hits.push({
      type: "company",
      id: co.id,
      title: co.name,
      subtitle: co.tax_id ?? undefined,
      href: `/companies/${co.id}`,
    });
  }
  for (const t of tickets.data ?? []) {
    hits.push({
      type: "ticket",
      id: t.id,
      title: t.subject ?? `Ticket #${t.number}`,
      subtitle: `#${t.number} · ${t.status}`,
      href: `/inbox/${t.id}`,
    });
  }
  for (const d of deals.data ?? []) {
    hits.push({
      type: "deal",
      id: d.id,
      title: d.title,
      subtitle: `${d.currency} ${d.value_amount}`,
      href: `/deals/${d.id}`,
    });
  }
  for (const tk of tasks.data ?? []) {
    hits.push({
      type: "task",
      id: tk.id,
      title: tk.title,
      subtitle: tk.status,
      href: `/tasks/${tk.id}`,
    });
  }

  return hits;
}
