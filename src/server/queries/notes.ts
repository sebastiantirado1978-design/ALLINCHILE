import { createClient } from "@/lib/supabase/server";

export type NoteRow = {
  id: string;
  body: string;
  related_type: "contact" | "company" | "deal" | "ticket" | "task";
  related_id: string;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  author?: { full_name: string | null; email: string } | null;
};

export async function listNotesFor(
  orgId: string,
  relatedType: NoteRow["related_type"],
  relatedId: string,
): Promise<NoteRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notes")
    .select("id, body, related_type, related_id, author_id, created_at, updated_at, author:profiles!notes_author_id_fkey(full_name, email)")
    .eq("organization_id", orgId)
    .eq("related_type", relatedType)
    .eq("related_id", relatedId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as NoteRow[];
}
