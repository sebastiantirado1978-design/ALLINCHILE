import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportCsvButton } from "@/components/app/export-button";
import { getCurrentOrg } from "@/server/queries/me";
import { listTasks, type TaskFilter } from "@/server/queries/tasks";
import { TaskRowItem } from "./task-row";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const tabs: { key: TaskFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "mine", label: "Mías" },
  { key: "open", label: "Abiertas" },
  { key: "overdue", label: "Vencidas" },
  { key: "done", label: "Completadas" },
];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: TaskFilter }>;
}) {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const params = await searchParams;
  const filter = params.filter ?? "all";
  const tasks = await listTasks(org.id, filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tasks.length} {tasks.length === 1 ? "tarea" : "tareas"}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton entity="tasks" />
          <Link href="/tasks/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nueva tarea
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[var(--border)] overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/tasks" : `/tasks?filter=${t.key}`}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
              filter === t.key
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-white p-12 text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
            <CheckSquare className="h-5 w-5 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="font-semibold">Sin tareas en esta vista</h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-4">
            Crea una tarea para empezar a organizar tu trabajo.
          </p>
          <Link href="/tasks/new">
            <Button><Plus className="h-4 w-4" />Nueva tarea</Button>
          </Link>
        </div>
      ) : (
        <ul className="rounded-xl border border-[var(--border)] bg-white divide-y divide-[var(--border)] overflow-hidden">
          {tasks.map((t) => (
            <TaskRowItem key={t.id} task={t} />
          ))}
        </ul>
      )}
    </div>
  );
}
