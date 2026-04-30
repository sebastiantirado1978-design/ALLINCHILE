import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
}) {
  const toneStyles: Record<string, string> = {
    default: "bg-[var(--muted)] text-[var(--foreground)]",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    accent: "bg-cyan-50 text-cyan-700",
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">{label}</p>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", toneStyles[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}
