"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  orgSettingsSchema,
  inviteSchema,
  templateSchema,
  type OrgSettingsInput,
  type InviteInput,
  type TemplateInput,
} from "@/lib/validations/settings";
import { getCurrentOrg } from "@/server/queries/me";
import { getMyRole } from "@/server/queries/settings";
import { inviteLimiter } from "@/lib/rate-limit";
import { sendInvitationEmail } from "@/lib/email";

type Result = { ok?: boolean; error?: string };
type InviteResult = Result & { token?: string };

async function requireRole(orgId: string, allowed: string[]): Promise<Result | null> {
  const role = await getMyRole(orgId);
  if (!role || !allowed.includes(role)) {
    return { error: "No tienes permiso para hacer esto" };
  }
  return null;
}

// ============================================================================
// Organización
// ============================================================================

export async function updateOrgSettingsAction(input: OrgSettingsInput): Promise<Result> {
  const parsed = orgSettingsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const guard = await requireRole(org.id, ["owner", "admin"]);
  if (guard) return guard;

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.name,
      industry: parsed.data.industry || null,
      country: parsed.data.country,
      primary_color: parsed.data.primary_color,
      logo_url: parsed.data.logo_url || null,
    })
    .eq("id", org.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ============================================================================
// Miembros / Roles
// ============================================================================

export async function updateMemberRoleAction(membershipId: string, role: string): Promise<Result> {
  const allowedRoles = ["admin", "manager", "agent", "viewer"];
  if (!allowedRoles.includes(role)) return { error: "Rol inválido" };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const guard = await requireRole(org.id, ["owner", "admin"]);
  if (guard) return guard;

  const supabase = await createClient();
  // No permitimos cambiar el rol de un owner
  const { data: target } = await supabase
    .from("memberships")
    .select("role, user_id")
    .eq("id", membershipId)
    .eq("organization_id", org.id)
    .single();
  if (!target) return { error: "Miembro no encontrado" };
  if (target.role === "owner") return { error: "No se puede cambiar el rol de un owner" };

  const { error } = await supabase
    .from("memberships")
    .update({ role })
    .eq("id", membershipId)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { ok: true };
}

export async function removeMemberAction(membershipId: string): Promise<Result> {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const guard = await requireRole(org.id, ["owner", "admin"]);
  if (guard) return guard;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: target } = await supabase
    .from("memberships")
    .select("role, user_id")
    .eq("id", membershipId)
    .eq("organization_id", org.id)
    .single();

  if (!target) return { error: "Miembro no encontrado" };
  if (target.role === "owner") return { error: "No se puede eliminar un owner" };
  if (target.user_id === user.id) return { error: "No puedes eliminarte a ti mismo" };

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", membershipId)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { ok: true };
}

// ============================================================================
// Invitaciones
// ============================================================================

export async function createInvitationAction(input: InviteInput): Promise<InviteResult> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const guard = await requireRole(org.id, ["owner", "admin"]);
  if (guard) return guard;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const rl = inviteLimiter.check(`invite:${org.id}`);
  if (!rl.allowed) {
    return { error: `Límite de invitaciones excedido. Espera ${rl.resetInSec}s.` };
  }

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      organization_id: org.id,
      email: parsed.data.email,
      role: parsed.data.role,
      invited_by: user.id,
    })
    .select("id, token")
    .single();

  if (error) return { error: error.message };

  // Best-effort: enviar email de invitación. Si Resend no está configurado,
  // sendInvitationEmail loguea y devuelve sent:false sin lanzar.
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();
    await sendInvitationEmail({
      to: parsed.data.email,
      organizationName: org.name,
      inviterName: profile?.full_name ?? profile?.email ?? "Tu equipo",
      role: parsed.data.role,
      token: data.token,
    });
  } catch (e) {
    console.error("[invitation] email send failed (non-blocking):", e);
  }

  revalidatePath("/settings");
  return { ok: true, token: data.token };
}

export async function revokeInvitationAction(invitationId: string): Promise<Result> {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const guard = await requireRole(org.id, ["owner", "admin"]);
  if (guard) return guard;

  const supabase = await createClient();
  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", invitationId)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { ok: true };
}

export async function acceptInvitationAction(token: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión primero" };

  const { data, error } = await supabase.rpc("accept_invitation", { p_token: token });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(`/dashboard?welcome=1&org=${data}`);
}

// ============================================================================
// Plantillas de mensajes
// ============================================================================

export async function createTemplateAction(input: TemplateInput): Promise<Result> {
  const parsed = templateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("message_templates").insert({
    organization_id: org.id,
    title: parsed.data.title,
    body: parsed.data.body,
    shortcut: parsed.data.shortcut || null,
    created_by: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}

export async function updateTemplateAction(id: string, input: TemplateInput): Promise<Result> {
  const parsed = templateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("message_templates")
    .update({
      title: parsed.data.title,
      body: parsed.data.body,
      shortcut: parsed.data.shortcut || null,
    })
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}

export async function deleteTemplateAction(id: string): Promise<Result> {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("message_templates")
    .delete()
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}
