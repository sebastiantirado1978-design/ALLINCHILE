import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentOrg } from "@/server/queries/me";
import { listOrgMembers } from "@/server/queries/tasks";
import { TaskForm } from "../task-form";

export const dynamic = "force-dynamic";

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ relatedType?: string; relatedId?: string }>;
}) {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const members = await listOrgMembers(org.id);
  const params = await searchParams;
  const allowedTypes = ["contact", "company", "deal", "ticket", "task"] as const;
  const presetType =
    params.relatedType && (allowedTypes as readonly string[]).includes(params.relatedType)
      ? (params.relatedType as (typeof allowedTypes)[number])
      : undefined;
  const preset = presetType && params.relatedId
    ? { type: presetType, id: params.relatedId }
    : undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/tasks"
          className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-[var(--muted)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva tarea</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Crea una tarea con vencimiento, prioridad y responsable.
          </p>
        </div>
      </div>

      <TaskForm members={members} presetRelated={preset} />
    </div>
  );
}
