import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentOrg } from "@/server/queries/me";
import { getTask, listOrgMembers } from "@/server/queries/tasks";
import { TaskForm } from "../task-form";
import { DeleteTaskButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const { id } = await params;
  const task = await getTask(org.id, id);
  if (!task) notFound();

  const members = await listOrgMembers(org.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a tareas
        </Link>
        <DeleteTaskButton id={task.id} />
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar tarea</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Cambia los detalles, marca como completada o reasigna.
        </p>
      </div>

      <TaskForm
        members={members}
        taskId={task.id}
        initial={{
          title: task.title,
          description: task.description ?? "",
          status: task.status,
          priority: task.priority,
          due_at: task.due_at ? task.due_at.slice(0, 16) : "",
          assignee_id: task.assignee_id ?? "",
          related_type: task.related_type ?? undefined,
          related_id: task.related_id ?? "",
        }}
      />
    </div>
  );
}
