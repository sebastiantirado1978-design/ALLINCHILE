import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Inbox as InboxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportCsvButton } from "@/components/app/export-button";
import { getCurrentOrg } from "@/server/queries/me";
import { listTickets } from "@/server/queries/tickets";
import { ticketStatusLabels } from "@/lib/validations/ticket";
import { KanbanColumn } from "./kanban-column";

export const dynamic = "force-dynamic";

const columns = [
  { status: "new", accent: "bg-blue-500" },
  { status: "in_progress", accent: "bg-amber-500" },
  { status: "waiting_customer", accent: "bg-cyan-500" },
  { status: "resolved", accent: "bg-emerald-500" },
] as const;

export default async function InboxPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const tickets = await listTickets(org.id);
  const grouped = Object.fromEntries(
    columns.map((c) => [c.status, tickets.filter((t) => t.status === c.status)]),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"} en total
          </p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton entity="tickets" />
          <Link href="/inbox/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nuevo ticket
            </Button>
          </Link>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-white p-12 text-center max-w-2xl mx-auto">
          <div className="h-12 w-12 mx-auto rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
            <InboxIcon className="h-5 w-5 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="font-semibold">Sin tickets aún</h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-4">
            Crea tu primer ticket. Cuando conectes WhatsApp/email, se crearán automáticamente al recibir mensajes.
          </p>
          <Link href="/inbox/new">
            <Button><Plus className="h-4 w-4" />Crear ticket</Button>
          </Link>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 lg:mx-0 lg:px-0">
          {columns.map((c) => (
            <KanbanColumn
              key={c.status}
              title={ticketStatusLabels[c.status]}
              count={grouped[c.status].length}
              tickets={grouped[c.status]}
              accent={c.accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
