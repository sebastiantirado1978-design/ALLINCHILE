"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { templateSchema, type TemplateInput } from "@/lib/validations/settings";
import {
  createTemplateAction,
  updateTemplateAction,
  deleteTemplateAction,
} from "@/server/actions/settings";

type Template = {
  id: string;
  title: string;
  body: string;
  shortcut: string | null;
};

export function TemplatesManager({ templates }: { templates: Template[] }) {
  const [editing, setEditing] = useState<Template | "new" | null>(null);
  const [pending, start] = useTransition();

  function remove(id: string, title: string) {
    if (!confirm(`¿Eliminar la plantilla "${title}"?`)) return;
    start(async () => {
      const res = await deleteTemplateAction(id);
      if (res?.error) toast.error(res.error);
      else toast.success("Plantilla eliminada");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" />
          Nueva plantilla
        </Button>
      </div>

      {editing && (
        <TemplateEditor
          template={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      {templates.length === 0 && !editing ? (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
          Aún no tienes plantillas. Crea la primera para acelerar tus respuestas.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {templates.map((t) => (
            <li key={t.id} className="py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{t.title}</p>
                  {t.shortcut && (
                    <code className="text-xs px-1.5 py-0.5 rounded bg-[var(--muted)] font-mono">
                      {t.shortcut}
                    </code>
                  )}
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2 whitespace-pre-wrap">
                  {t.body}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing(t)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => remove(t.id, t.title)}
                loading={pending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TemplateEditor({
  template,
  onClose,
}: {
  template: Template | null;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: template?.title ?? "",
      body: template?.body ?? "",
      shortcut: template?.shortcut ?? "",
    },
  });

  async function onSubmit(values: TemplateInput) {
    const res = template
      ? await updateTemplateAction(template.id, values)
      : await createTemplateAction(values);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success(template ? "Plantilla actualizada" : "Plantilla creada");
    onClose();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border border-[var(--border)] p-4 bg-[var(--muted)]/30 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {template ? "Editar plantilla" : "Nueva plantilla"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="title">Título *</Label>
          <Input id="title" placeholder="Saludo inicial" {...register("title")} />
          {errors.title && <p className="text-xs text-[var(--danger)]">{errors.title.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="shortcut">Atajo</Label>
          <Input id="shortcut" placeholder="/saludo" {...register("shortcut")} />
          {errors.shortcut && <p className="text-xs text-[var(--danger)]">{errors.shortcut.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Cuerpo *</Label>
        <textarea
          id="body"
          rows={4}
          className="w-full px-3 py-2 rounded-md border border-[var(--input)] bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          placeholder="Hola {{nombre}}, gracias por contactarnos..."
          {...register("body")}
        />
        {errors.body && <p className="text-xs text-[var(--danger)]">{errors.body.message}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={isSubmitting}>
          {template ? "Guardar" : "Crear plantilla"}
        </Button>
      </div>
    </form>
  );
}
