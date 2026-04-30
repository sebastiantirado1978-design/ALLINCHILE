"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn, formatRelative } from "@/lib/utils";
import { PriorityBadge } from "@/components/app/priority-badge";
import { toggleTaskDoneAction } from "@/server/actions/tasks";
import type { TaskRow } from "@/server/queries/tasks";

export function TaskRowItem({ task }: { task: TaskRow }) {
  const [pending, start] = useTransition();
  const [optimisticDone, setOptimisticDone] = useState(task.status === "done");

  const overdue =
    task.due_at && task.status !== "done" && new Date(task.due_at) < new Date();

  function toggle() {
    const next = !optimisticDone;
    setOptimisticDone(next);
    start(async () => {
      const res = await toggleTaskDoneAction(task.id, next);
      if (res?.error) {
        setOptimisticDone(!next);
        toast.error(res.error);
      } else {
        toast.success(next ? "Tarea completada" : "Tarea reabierta");
      }
    });
  }

  return (
    <li className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--muted)]/40 transition-colors">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={optimisticDone ? "Reabrir tarea" : "Marcar como completada"}
        className={cn(
          "h-5 w-5 mt-0.5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
          optimisticDone
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-slate-300 hover:border-emerald-500",
        )}
      >
        {optimisticDone && (
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <Link href={`/tasks/${task.id}`} className="block group">
          <p
            className={cn(
              "text-sm font-medium",
              optimisticDone && "line-through text-[var(--muted-foreground)]",
              !optimisticDone && "group-hover:text-[var(--primary)]",
            )}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
              {task.description}
            </p>
          )}
        </Link>

        <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--muted-foreground)]">
          {task.due_at && (
            <span className={cn("flex items-center gap-1", overdue && "text-red-600 font-medium")}>
              {overdue ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
              {formatRelative(task.due_at)}
            </span>
          )}
          <PriorityBadge priority={task.priority} />
        </div>
      </div>
    </li>
  );
}
