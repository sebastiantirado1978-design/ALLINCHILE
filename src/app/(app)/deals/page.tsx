import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportCsvButton } from "@/components/app/export-button";
import { getCurrentOrg } from "@/server/queries/me";
import {
  ensureDefaultPipeline,
  listDeals,
  listStages,
} from "@/server/queries/deals";
import { PipelineBoard } from "./pipeline-board";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  let pipeline;
  try {
    pipeline = await ensureDefaultPipeline(org.id);
  } catch {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <h2 className="text-xl font-bold">Configurando pipeline...</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Recarga la página en unos segundos.
        </p>
      </div>
    );
  }

  const [stages, deals] = await Promise.all([
    listStages(org.id, pipeline.id),
    listDeals(org.id, pipeline.id),
  ]);

  const activeDeals = deals.filter((d) => !d.is_won && !d.is_lost);
  const totalValue = activeDeals.reduce((s, d) => s + Number(d.value_amount ?? 0), 0);
  const wonValue = deals
    .filter((d) => d.is_won)
    .reduce((s, d) => s + Number(d.value_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM — {pipeline.name}</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {activeDeals.length} oportunidad
            {activeDeals.length === 1 ? "" : "es"} activa{activeDeals.length === 1 ? "" : "s"} ·{" "}
            <strong>{formatCurrency(totalValue)}</strong> en pipeline ·{" "}
            <span className="text-emerald-700">{formatCurrency(wonValue)}</span> ganadas
          </p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton entity="deals" />
          <Link href="/deals/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nueva oportunidad
            </Button>
          </Link>
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-white p-12 text-center max-w-2xl mx-auto">
          <div className="h-12 w-12 mx-auto rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
            <Briefcase className="h-5 w-5 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="font-semibold">Aún no tienes oportunidades</h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-4">
            Crea tu primera oportunidad y empieza a moverla por el pipeline.
          </p>
          <Link href="/deals/new">
            <Button><Plus className="h-4 w-4" />Nueva oportunidad</Button>
          </Link>
        </div>
      ) : (
        <PipelineBoard stages={stages} deals={deals} />
      )}
    </div>
  );
}
