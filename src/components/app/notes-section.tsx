"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { initials, formatRelative, cn } from "@/lib/utils";
import {
  createNoteAction,
  updateNoteAction,
  deleteNoteAction,
} from "@/server/actions/notes";
import type { NoteRow } from "@/server/queries/notes";
import type { NoteInput } from "@/lib/validations/note";

export function NotesSection({
  notes,
  relatedType,
  relatedId,
  currentUserId,
}: {
  notes: NoteRow[];
  relatedType: NoteInput["related_type"];
  relatedId: string;
  currentUserId: string;
}) {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  function add() {
    const trimmed = body.trim();
    if (!trimmed) return;
    start(async () => {
      const res = await createNoteAction({
        body: trimmed,
        related_type: relatedType,
        related_id: relatedId,
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Nota agregada");
        setBody("");
      }
    });
  }

  function startEdit(n: NoteRow) {
    setEditingId(n.id);
    setEditBody(n.body);
  }

  function saveEdit(id: string) {
    start(async () => {
      const res = await updateNoteAction(id, editBody);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Nota actualizada");
        setEditingId(null);
      }
    });
  }

  function remove(id: string) {
    if (!confirm("¿Eliminar esta nota?")) return;
    start(async () => {
      const res = await deleteNoteAction(id);
      if (res?.error) toast.error(res.error);
      else toast.success("Nota eliminada");
    });
  }

  return (
    <div className="space-y-3">
      {/* Composer */}
      <div className="rounded-lg border border-[var(--border)] bg-white p-3 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              add();
            }
          }}
          rows={2}
          placeholder="Agrega una nota interna..."
          className="w-full px-2 py-1.5 text-sm bg-transparent resize-none focus-visible:outline-none"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--muted-foreground)]">
            ⌘+Enter para guardar
          </span>
          <Button size="sm" onClick={add} disabled={!body.trim()} loading={pending}>
            Agregar nota
          </Button>
        </div>
      </div>

      {/* Lista */}
      {notes.length === 0 ? (
        <p className="text-xs text-[var(--muted-foreground)] text-center py-4">
          Sin notas aún
        </p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => {
            const author = n.author?.full_name ?? n.author?.email ?? "Usuario";
            const canEdit = n.author_id === currentUserId;
            const isEditing = editingId === n.id;

            return (
              <li
                key={n.id}
                className="rounded-lg border border-[var(--border)] bg-white p-3"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-6 w-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {initials(author)}
                  </div>
                  <p className="text-xs font-medium flex-1 truncate">{author}</p>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {formatRelative(n.created_at)}
                  </span>
                  {canEdit && !isEditing && (
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => startEdit(n)}
                        className="h-6 w-6 rounded flex items-center justify-center hover:bg-[var(--muted)]"
                        aria-label="Editar"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => remove(n.id)}
                        className="h-6 w-6 rounded flex items-center justify-center hover:bg-red-50 text-red-600"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={3}
                      className="w-full px-2 py-1.5 text-sm rounded border border-[var(--input)] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="h-7 px-2 rounded text-xs flex items-center gap-1 hover:bg-[var(--muted)]"
                      >
                        <X className="h-3 w-3" />
                        Cancelar
                      </button>
                      <button
                        onClick={() => saveEdit(n.id)}
                        disabled={!editBody.trim() || pending}
                        className={cn(
                          "h-7 px-2 rounded text-xs flex items-center gap-1 bg-[var(--primary)] text-white disabled:opacity-50",
                        )}
                      >
                        <Check className="h-3 w-3" />
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{n.body}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
