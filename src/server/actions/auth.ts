"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "@/lib/validations/auth";
import { sendWelcomeEmail } from "@/lib/email";

export type AuthResult = { error?: string; ok?: boolean };

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60) + "-" + Math.random().toString(36).slice(2, 6);
}

export async function loginAction(input: LoginInput): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signupAction(input: SignupInput): Promise<AuthResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const isInviteFlow = !!parsed.data.invite_token;
  if (!isInviteFlow && !parsed.data.organization_name) {
    return { error: "Ingresa el nombre de tu empresa" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
    },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "No se pudo crear la cuenta" };

  if (isInviteFlow) {
    // Aceptar la invitación; crea membership y actualiza default_org_id
    const { error: rpcErr } = await supabase.rpc("accept_invitation", {
      p_token: parsed.data.invite_token,
    });
    if (rpcErr) return { error: rpcErr.message };
  } else {
    // Flujo normal: crear org + membership owner
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({
        name: parsed.data.organization_name!,
        slug: slugify(parsed.data.organization_name!),
      })
      .select("id")
      .single();

    if (orgErr || !org) {
      return { error: orgErr?.message ?? "No se pudo crear la organización" };
    }

    const { error: memErr } = await supabase.from("memberships").insert({
      user_id: data.user.id,
      organization_id: org.id,
      role: "owner",
    });

    if (memErr) return { error: memErr.message };

    await supabase
      .from("profiles")
      .update({ default_org_id: org.id })
      .eq("id", data.user.id);

    // Email de bienvenida (best-effort, no bloquea)
    try {
      await sendWelcomeEmail({
        to: parsed.data.email,
        fullName: parsed.data.full_name,
        organizationName: parsed.data.organization_name!,
      });
    } catch (e) {
      console.error("[signup] welcome email failed (non-blocking):", e);
    }
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
