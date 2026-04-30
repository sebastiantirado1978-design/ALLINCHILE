import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ModuleInProgress({
  icon: Icon,
  title,
  week,
  description,
  features,
}: {
  icon: LucideIcon;
  title: string;
  week: number;
  description: string;
  features: string[];
}) {
  return (
    <div className="max-w-2xl mx-auto py-16">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-10 text-center">
        <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center mb-5">
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-xs font-medium text-[var(--accent)] tracking-wide uppercase mb-2">
          Roadmap MVP — Semana {week}
        </p>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-[var(--muted-foreground)] mt-3 max-w-md mx-auto">{description}</p>

        <div className="mt-8 text-left rounded-xl bg-[var(--muted)] p-5">
          <p className="text-sm font-medium mb-3">Qué incluirá este módulo:</p>
          <ul className="space-y-2 text-sm text-[var(--foreground)]">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline">Volver al dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
