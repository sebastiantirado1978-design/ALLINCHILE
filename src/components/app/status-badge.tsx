import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  lead: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
  churned: "bg-red-50 text-red-700 border-red-200",
};

const labels: Record<string, string> = {
  lead: "Lead",
  active: "Activo",
  inactive: "Inactivo",
  churned: "Perdido",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border",
        styles[status] ?? "bg-slate-100 text-slate-600 border-slate-200",
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
