import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ArrowRight,
  Mail,
  MessageCircle,
  CheckSquare,
  Inbox,
  StickyNote,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditLogList } from "@/components/app/audit-log-list";
import { TaskStatusBadge, PriorityBadge } from "@/components/app/priority-badge";
import { TicketStatusBadge } from "@/components/app/ticket-status-badge";
import { NotesSection } from "@/components/app/notes-section";
import { getCurrentOrg, getCurrentUser } from "@/server/queries/me";
import { getDeal, listPipelines, listStages } from "@/server/queries/deals";
import { listContacts, listAuditLogs } from "@/server/queries/contacts";
import { listOrgMembers, listTasksFor } from "@/server/queries/tasks";
import { listTicketsForDeal } from "@/server/queries/tickets";
import { listNotesFor } from "@/server/queries/notes";
import { formatCurrency, formatDate, formatRelative } from "@/lib/utils";
import { DealForm } from "../deal-form";
import { DeleteDealButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const org = await getCurrentOrg();
  const user = await getCurrentUser();
  if (!org || !user) redirect("/dashboard");

  const { id } = await params;
  const deal = await getDeal(org.id, id);
  if (!deal) notFound();

  const [pipelines, stages, contacts, members, logs, relatedTasks, relatedTickets, notes] =
    await Promise.all([
      listPipelines(org.id),
      listStages(org.id),
      listContacts(org.id),
      listOrgMembers(org.id),
      listAuditLogs(org.id, "deal", id, 15),
      listTasksFor(org.id, "deal", id),
      listTicketsForDeal(org.id, id),
      listNotesFor(org.id, "deal", id),
    ]);

  type DealContact = {
    id: string;
    full_name: string;
    email: string | null;
    whatsapp: string | null;
  } | null;
  const dealContact = deal.contact as DealContact;
  const stage = stages.find((s) => s.id === deal.stage_id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/deals"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al pipeline
        </Link>
        <DeleteDealButton id={deal.id} />
      </div>

      {/* Encabezado */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {stage && (
                  <span
                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      background: `${stage.color}20`,
                      color: stage.color,
                    }}
                  >
                    {stage.name}
                  </span>
                )}
                {deal.is_won && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    🏆 Ganada
                  </span>
                )}
                {deal.is_lost && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-700">
                    Perdida
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{deal.title}</h1>
              {deal.description && (
                <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-2xl whitespace-pre-wrap">
                  {deal.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[var(--primary)]">
                {formatCurrency(deal.value_amount, deal.currency)}
              </p>
              {deal.expected_close_date && (
                <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 justify-end mt-1">
                  <Calendar className="h-3 w-3" />
                  Cierre {formatDate(deal.expected_close_date)}
                </p>
              )}
            </div>
          </div>

          {deal.next_action && (
            <div className="mt-4 p-3 rounded-lg bg-cyan-50 border border-cyan-200 flex items-start gap-2">
              <ArrowRight className="h-4 w-4 text-cyan-700 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-cyan-900">Próxima acción</p>
                <p className="text-cyan-800">{deal.next_action}</p>
                {deal.next_action_at && (
                  <p className="text-xs text-cyan-700 mt-1">
                    {formatRelative(deal.next_action_at)}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar oportunidad</CardTitle>
            </CardHeader>
            <CardContent>
              <DealForm
                dealId={deal.id}
                pipelines={pipelines}
                stages={stages}
                contacts={contacts.map((c) => ({ id: c.id, full_name: c.full_name }))}
                members={members}
                initial={{
                  title: deal.title,
                  description: deal.description ?? "",
                  pipeline_id: deal.pipeline_id,
                  stage_id: deal.stage_id,
                  contact_id: deal.contact_id ?? "",
                  owner_id: deal.owner_id ?? "",
                  value_amount: Number(deal.value_amount ?? 0),
                  currency: deal.currency,
                  expected_close_date: deal.expected_close_date ?? "",
                  next_action: deal.next_action ?? "",
                  next_action_at: deal.next_action_at ? deal.next_action_at.slice(0, 16) : "",
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tareas
              </CardTitle>
              <Link href={`/tasks/new?relatedType=deal&relatedId=${deal.id}`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Nueva tarea
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {relatedTasks.length === 0 ? (
                <EmptyMini icon={CheckSquare} text="Sin tareas para esta oportunidad" />
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {relatedTasks.map((t) => (
                    <li key={t.id} className="py-3 flex items-center gap-3">
                      <Link href={`/tasks/${t.id}`} className="flex-1 min-w-0 hover:text-[var(--primary)]">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        {t.due_at && (
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Vence {formatRelative(t.due_at)}
                          </p>
                        )}
                      </Link>
                      <PriorityBadge priority={t.priority} />
                      <TaskStatusBadge status={t.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {relatedTickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="h-4 w-4" />
                  Tickets del contacto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-[var(--border)]">
                  {relatedTickets.map((t) => (
                    <li key={t.id} className="py-3 flex items-center gap-3">
                      <span className="text-xs font-mono text-[var(--muted-foreground)]">
                        #{t.number}
                      </span>
                      <Link href={`/inbox/${t.id}`} className="flex-1 min-w-0 hover:text-[var(--primary)]">
                        <p className="text-sm font-medium truncate">{t.subject ?? "Sin asunto"}</p>
                      </Link>
                      <TicketStatusBadge status={t.status} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Notas internas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotesSection
                notes={notes}
                relatedType="deal"
                relatedId={deal.id}
                currentUserId={user.id}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {dealContact && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href={`/contacts/${dealContact.id}`}
                  className="font-medium hover:text-[var(--primary)] block"
                >
                  {dealContact.full_name}
                </Link>
                {dealContact.email && (
                  <a
                    href={`mailto:${dealContact.email}`}
                    className="flex items-center gap-2 text-sm hover:text-[var(--primary)]"
                  >
                    <Mail className="h-4 w-4" />
                    {dealContact.email}
                  </a>
                )}
                {dealContact.whatsapp && (
                  <a
                    href={`https://wa.me/${dealContact.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-emerald-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {dealContact.whatsapp}
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditLogList logs={logs} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EmptyMini({ icon: Icon, text }: { icon: typeof CheckSquare; text: string }) {
  return (
    <div className="text-center py-6">
      <Icon className="h-7 w-7 mx-auto text-[var(--muted-foreground)] opacity-30" />
      <p className="text-sm text-[var(--muted-foreground)] mt-2">{text}</p>
    </div>
  );
}
