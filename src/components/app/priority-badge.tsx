import { cn } from "@/lib/utils";

const priorityStyles: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  normal: "bg-blue-50 text-blue-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-red-50 text-red-700",
};

const priorityLabels: Record<string, string> = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

const taskStatusStyles: Record<string, string> = {
  open: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-600",
};

const taskStatusLabels: Record<string, string> = {
  open: "Abierta",
  in_progress: "En curso",
  done: "Completada",
  cancelled: "Cancelada",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full",
        priorityStyles[priority] ?? priorityStyles.normal,
      )}
    >
      {priorityLabels[priority] ?? priority}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full",
        taskStatusStyles[status] ?? taskStatusStyles.open,
      )}
    >
      {taskStatusLabels[status] ?? status}
    </span>
  );
}
