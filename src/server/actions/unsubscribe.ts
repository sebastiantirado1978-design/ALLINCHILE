"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type UnsubscribeResult = {
  ok?: boolean;
  error?: string;
};

/**
 * Marca un contacto como dado de baja a partir de su unsubscribe_token público.
 * Bypasea RLS porque el token UUID es el secret — quien lo tiene tiene
 * derecho a opt-out, sin necesidad de estar autenticado a la org.
 */
export async function markContactUnsubscribedAction(
  token: string,
): Promise<UnsubscribeResult> {
  if (!token || token.length < 16) {
    return { error: "Token inválido" };
  }
  const admin = createAdminClient();

  // Verificar existencia y no marcado previamente
  const { data: contact, error: lookupErr } = await admin
    .from("contacts")
    .select("id, unsubscribed_at, organization_id")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (lookupErr || !contact) {
    return { error: "No encontramos un contacto con ese link." };
  }

  if (contact.unsubscribed_at) {
    return { ok: true }; // idempotente
  }

  const { error } = await admin
    .from("contacts")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("id", contact.id);

  if (error) return { error: error.message };
  return { ok: true };
}
