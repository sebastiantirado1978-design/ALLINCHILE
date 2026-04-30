import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Tag,
  Pencil,
  Plus,
  CheckSquare,
  Briefcase,
  Inbox,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/app/status-badge";
import { AuditLogList } from "@/components/app/audit-log-list";
import { TaskStatusBadge, PriorityBadge } from "@/components/app/priority-badge";
import { TicketStatusBadge } from "@/components/app/ticket-status-badge";
import { NotesSection } from "@/components/app/notes-section";
import { getCurrentOrg, getCurrentUser } from "@/server/queries/me";
import { getContact, listContactChannels, listAuditLogs } from "@/server/queries/contacts";
import { listTasksFor } from "@/server/queries/tasks";
import { listDealsForContact } from "@/server/queries/deals";
import { listTicketsForContact } from "@/server/queries/tickets";
import { listNotesFor } from "@/server/queries/notes";
import { initials, formatDate, formatRelative, formatCurrency } from "@/lib/utils";
import { ChannelsManager } from "./channels-manager";
import { DeleteContactButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const org = await getCurrentOrg();
  const user = await getCurrentUser();
  if (!org || !user) redirect("/dashboard");

  const { id } = await params;
  const contact = await getContact(org.id, id);
  if (!contact) notFound();

  const [channels, logs, relatedTasks, relatedDeals, relatedTickets, notes] = await Promise.all([
    listContactChannels(org.id, id),
    listAuditLogs(org.id, "contact", id, 10),
    listTasksFor(org.id, "contact", id),
    listDealsForContact(org.id, id),
    listTicketsForContact(org.id, id),
    listNotesFor(org.id, "contact", id),
  ]);

  const activeDeals = relatedDeals.filter((d) => !d.is_won && !d.is_lost);
  const wonDeals = relatedDeals.filter((d) => d.is_won);
  const totalActive = activeDeals.reduce((s, d) => s + Number(d.value_amount ?? 0), 0);
  const totalWon = wonDeals.reduce((s, d) => s + Number(d.value_amount ?? 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a contactos
        </Link>
        <div className="flex gap-2">
          <Link href={`/contacts/${contact.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <DeleteContactButton id={contact.id} />
        </div>
      </div>

      {/* Encabezado */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center text-2xl font-semibold shrink-0">
              {initials(contact.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{contact.full_name}</h1>
                  {contact.job_title && (
                    <p className="text-[var(--muted-foreground)]">{contact.job_title}</p>
                  )}
                </div>
                <StatusBadge status={contact.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {contact.email && (
                  <a href={`mailto:${contact.email}`}>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />Email
                    </Button>
                  </a>
                )}
                {(contact.whatsapp || contact.phone) && (
                  <a
                    href={`https://wa.me/${(contact.whatsapp ?? contact.phone).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="text-emerald-700">
                      <MessageCircle className="h-4 w-4" />WhatsApp
                    </Button>
                  </a>
                )}
                {contact.phone && (
                  <a href={`tel:${contact.phone}`}>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />Llamar
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats vinculadas — solo si hay datos */}
          {(relatedDeals.length > 0 || relatedTickets.length > 0 || relatedTasks.length > 0) && (
            <div className="mt-5 pt-5 border-t border-[var(--border)] grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{relatedDeals.length}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Oportunidades</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{relatedTickets.length}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Tickets</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{relatedTasks.length}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Tareas</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izq: información + oportunidades + tickets + tareas + notas */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailRow icon={Mail} label="Email" value={contact.email} />
              <DetailRow icon={Phone} label="Teléfono" value={contact.phone} />
              <DetailRow icon={MessageCircle} label="WhatsApp" value={contact.whatsapp} />
              <DetailRow icon={MapPin} label="Ciudad" value={contact.city} />
              <DetailRow icon={Tag} label="Fuente" value={contact.source} />
              <DetailRow icon={Calendar} label="Creado" value={formatDate(contact.created_at)} />
              {contact.notes && (
                <div className="pt-3 border-t border-[var(--border)]">
                  <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1">Notas del perfil</p>
                  <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Oportunidades
                </CardTitle>
                {(activeDeals.length > 0 || wonDeals.length > 0) && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {formatCurrency(totalActive)} en pipeline ·{" "}
                    <span className="text-emerald-700">{formatCurrency(totalWon)}</span> ganadas
                  </p>
                )}
              </div>
              <Link href={`/deals/new?contact_id=${contact.id}`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Nueva
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {relatedDeals.length === 0 ? (
                <EmptyMini icon={Briefcase} text="Sin oportunidades para este contacto" />
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {relatedDeals.map((d) => (
                    <li key={d.id} className="py-3 flex items-start gap-3">
                      <Link href={`/deals/${d.id}`} className="flex-1 min-w-0 hover:text-[var(--primary)]">
                        <p className="text-sm font-medium truncate">{d.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {formatCurrency(d.value_amount, d.currency)}
                          {d.expected_close_date && ` · cierre ${formatDate(d.expected_close_date)}`}
                        </p>
                      </Link>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          d.is_won
                            ? "bg-emerald-50 text-emerald-700"
                            : d.is_lost
                              ? "bg-red-50 text-red-700"
                              : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {d.is_won ? "Ganada" : d.is_lost ? "Perdida" : "Activa"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Tickets
              </CardTitle>
              <Link href={`/inbox/new?contact_id=${contact.id}`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Nuevo
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {relatedTickets.length === 0 ? (
                <EmptyMini icon={Inbox} text="Sin tickets de este contacto" />
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {relatedTickets.map((t) => (
                    <li key={t.id} className="py-3 flex items-start gap-3">
                      <span className="text-xs font-mono text-[var(--muted-foreground)] mt-0.5">
                        #{t.number}
                      </span>
                      <Link href={`/inbox/${t.id}`} className="flex-1 min-w-0 hover:text-[var(--primary)]">
                        <p className="text-sm font-medium truncate">{t.subject ?? "Sin asunto"}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {t.last_message_at && formatRelative(t.last_message_at)}
                        </p>
                      </Link>
                      <TicketStatusBadge status={t.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tareas
              </CardTitle>
              <Link href={`/tasks/new?relatedType=contact&relatedId=${contact.id}`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Nueva
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {relatedTasks.length === 0 ? (
                <EmptyMini icon={CheckSquare} text="Sin tareas para este contacto" />
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
                relatedType="contact"
                relatedId={contact.id}
                currentUserId={user.id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Columna der: canales + actividad */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Canales vinculados</CardTitle>
            </CardHeader>
            <CardContent>
              <ChannelsManager contactId={contact.id} channels={channels} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
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

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-[var(--muted-foreground)] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

function EmptyMini({ icon: Icon, text }: { icon: typeof Mail; text: string }) {
  return (
    <div className="text-center py-6">
      <Icon className="h-7 w-7 mx-auto text-[var(--muted-foreground)] opacity-30" />
      <p className="text-sm text-[var(--muted-foreground)] mt-2">{text}</p>
    </div>
  );
}
