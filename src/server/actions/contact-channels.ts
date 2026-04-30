"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { contactChannelSchema, type ContactChannelInput } from "@/lib/validations/contact-channel";
import { getCurrentOrg } from "@/server/queries/me";

export async function addContactChannelAction(contactId: string, input: ContactChannelInput) {
  const parsed = contactChannelSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("contact_channels").insert({
    contact_id: contactId,
    organization_id: org.id,
    channel: parsed.data.channel,
    identifier: parsed.data.identifier,
    is_primary: parsed.data.is_primary,
  });

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: "channel_linked",
    entity_type: "contact",
    entity_id: contactId,
    changes: { channel: parsed.data.channel, identifier: parsed.data.identifier },
  });

  revalidatePath(`/contacts/${contactId}`);
  return { ok: true };
}

export async function removeContactChannelAction(contactId: string, channelRowId: string) {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("contact_channels")
    .delete()
    .eq("id", channelRowId)
    .eq("organization_id", org.id)
    .eq("contact_id", contactId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: "channel_unlinked",
    entity_type: "contact",
    entity_id: contactId,
  });

  revalidatePath(`/contacts/${contactId}`);
  return { ok: true };
}
