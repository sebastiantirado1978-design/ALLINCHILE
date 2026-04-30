"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { noteSchema, type NoteInput } from "@/lib/validations/note";
import { getCurrentOrg } from "@/server/queries/me";

type Result = { ok?: boolean; error?: string };

function pathFor(type: NoteInput["related_type"], id: string) {
  switch (type) {
    case "contact":
      return `/contacts/${id}`;
    case "deal":
      return `/deals/${id}`;
    case "ticket":
      return `/inbox/${id}`;
    case "task":
      return `/tasks/${id}`;
    case "company":
      return `/companies/${id}`;
  }
}

export async function createNoteAction(input: NoteInput): Promise<Result> {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("notes").insert({
    organization_id: org.id,
    body: parsed.data.body,
    related_type: parsed.data.related_type,
    related_id: parsed.data.related_id,
    author_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath(pathFor(parsed.data.related_type, parsed.data.related_id));
  return { ok: true };
}

export async function updateNoteAction(id: string, body: string): Promise<Result> {
  if (!body.trim()) return { error: "La nota no puede estar vacía" };

  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Solo el autor puede editar (admins también).
  const { data: note } = await supabase
    .from("notes")
    .select("related_type, related_id, author_id")
    .eq("id", id)
    .eq("organization_id", org.id)
    .single();

  if (!note) return { error: "Nota no encontrada" };

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", org.id)
    .eq("user_id", user.id)
    .single();

  const isAuthor = note.author_id === user.id;
  const isAdmin = membership?.role === "owner" || membership?.role === "admin";
  if (!isAuthor && !isAdmin) {
    return { error: "Solo el autor o un admin puede editar esta nota" };
  }

  const { error } = await supabase
    .from("notes")
    .update({ body: body.trim() })
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  revalidatePath(pathFor(note.related_type as NoteInput["related_type"], note.related_id));
  return { ok: true };
}

export async function deleteNoteAction(id: string): Promise<Result> {
  const org = await getCurrentOrg();
  if (!org) return { error: "Sin organización activa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: note } = await supabase
    .from("notes")
    .select("related_type, related_id, author_id")
    .eq("id", id)
    .eq("organization_id", org.id)
    .single();

  if (!note) return { error: "Nota no encontrada" };

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", org.id)
    .eq("user_id", user.id)
    .single();

  const isAuthor = note.author_id === user.id;
  const isAdmin = membership?.role === "owner" || membership?.role === "admin";
  if (!isAuthor && !isAdmin) {
    return { error: "Solo el autor o un admin puede eliminar esta nota" };
  }

  const { error } = await supabase.from("notes").delete().eq("id", id).eq("organization_id", org.id);

  if (error) return { error: error.message };

  revalidatePath(pathFor(note.related_type as NoteInput["related_type"], note.related_id));
  return { ok: true };
}
