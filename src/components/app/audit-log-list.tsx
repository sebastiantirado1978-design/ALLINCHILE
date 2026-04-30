import { formatRelative } from "@/lib/utils";

const actionLabels: Record<string, string> = {
  created: "creó este registro",
  updated: "actualizó este registro",
  deleted: "eliminó este registro",
  assigned: "asignó",
  unassigned: "desasignó",
  completed: "completó la tarea",
  reopened: "reabrió la tarea",
  channel_linked: "vinculó un canal",
  channel_unlinked: "desvinculó un canal",
  status_changed_to_new: "cambió estado → Nuevo",
  status_changed_to_in_review: "cambió estado → En revisión",
  status_changed_to_in_progress: "cambió estado → En proceso",
  status_changed_to_waiting_customer: "cambió estado → Esperando cliente",
  status_changed_to_resolved: "cambió estado → Resuelto",
  status_changed_to_closed: "cambió estado → Cerrado",
  status_changed_to_rejected: "cambió estado → Rechazado",
};

type Log = {
  id: string;
  action: string;
  created_at: string;
  profiles: { full_name: string | null; email: string } | null;
};

export function AuditLogList({ logs }: { logs: Log[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)] text-center py-6">
        Sin actividad registrada
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {logs.map((l) => {
        const actor = l.profiles?.full_name ?? l.profiles?.email ?? "Sistema";
        const label = actionLabels[l.action] ?? l.action;
        return (
          <li key={l.id} className="flex gap-3 text-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] mt-2 shrink-0" />
            <div className="flex-1">
              <p>
                <strong>{actor}</strong>{" "}
                <span className="text-[var(--muted-foreground)]">{label}</span>
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {formatRelative(l.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
