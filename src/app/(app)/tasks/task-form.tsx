"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { taskSchema, type TaskInput } from "@/lib/validations/task";
import { createTaskAction, updateTaskAction } from "@/server/actions/tasks";

type Member = { id: string; full_name: string | null; email: string };

export function TaskForm({
  members,
  initial,
  taskId,
  presetRelated,
}: {
  members: Member[];
  initial?: Partial<TaskInput>;
  taskId?: string;
  presetRelated?: { type: TaskInput["related_type"]; id: string };
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      status: initial?.status ?? "open",
      priority: initial?.priority ?? "normal",
      due_at: initial?.due_at ?? "",
      assignee_id: initial?.assignee_id ?? "",
      related_type: initial?.related_type ?? presetRelated?.type,
      related_id: initial?.related_id ?? presetRelated?.id ?? "",
    },
  });

  async function onSubmit(values: TaskInput) {
    setServerError(null);
    const res = taskId
      ? await updateTaskAction(taskId, values)
      : await createTaskAction(values);

    if (res?.error) {
      setServerError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success(taskId ? "Tarea actualizada" : "Tarea creada");
    router.push("/tasks");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Detalles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" placeholder="Llamar a Juan Pérez" {...register("title")} />
            {errors.title && <p className="text-sm text-[var(--danger)]">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              rows={4}
              className="w-full px-3 py-2 rounded-md border border-[var(--input)] bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              placeholder="Detalle adicional..."
              {...register("description")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado y asignación</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
              {...register("status")}
            >
              <option value="open">Abierta</option>
              <option value="in_progress">En curso</option>
              <option value="done">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <select
              id="priority"
              className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
              {...register("priority")}
            >
              <option value="low">Baja</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_at">Vencimiento</Label>
            <Input id="due_at" type="datetime-local" {...register("due_at")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignee_id">Responsable</Label>
            <select
              id="assignee_id"
              className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
              {...register("assignee_id")}
            >
              <option value="">Sin asignar</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name ?? m.email}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Link href="/tasks">
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
        <Button type="submit" loading={isSubmitting}>
          {taskId ? "Guardar cambios" : "Crear tarea"}
        </Button>
      </div>
    </form>
  );
}
