import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  CheckSquare,
  StickyNote,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketStatusBadge } from "@/components/app/ticket-status-badge";
import { PriorityBadge, TaskStatusBadge } from "@/components/app/priority-badge";
import { NotesSection } from "@/components/app/notes-section";
import { getCurrentOrg, getCurrentUser } from "@/server/queries/me";
import { getTicket, listTicketMessages } from "@/server/queries/tickets";
import { listOrgMembers, listTasksFor } from "@/server/queries/tasks";
import { listTemplates } from "@/server/queries/settings";
import { listNotesFor } from "@/server/queries/notes";
import { formatDate, formatRelative, initials } from "@/lib/utils";
import { channelLabels } from "@/lib/validations/ticket";
import { TicketSidebar } from "./ticket-sidebar";
import { ConversationPane } from "./conversation-pane";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const org = await getCurrentOrg();
  const user = await getCurrentUser();
  if (!org || !user) redirect("/dashboard");

  const { id } = await params;
  const ticket = await getTicket(org.id, id);
  if (!ticket) notFound();

  const [messages, members, templates, relatedTasks, notes] = await Promise.all([
    listTicketMessages(id),
    listOrgMembers(org.id),
    listTemplates(org.id),
    listTasksFor(org.id, "ticket", id),
    listNotesFor(org.id, "ticket", id),
  ]);

  type TicketContact = {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
  } | null;
  type TicketChannel = { id: string; type: string; name: string } | null;
  const ticketContact = ticket.contact as TicketContact;
  const ticketChannel = ticket.channel as TicketChannel;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <Link
        href="/inbox"
        className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inbox
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 min-h-[600px]">
        {/* Conversación */}
        <Card className="flex flex-col">
          <CardHeader className="border-b border-[var(--border)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-mono text-[var(--muted-foreground)]">#{ticket.number}</p>
                <CardTitle className="mt-1">{ticket.subject ?? "Sin asunto"}</CardTitle>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <TicketStatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  {ticketChannel && (
                    <span className="text-xs px-2 py-0.5 bg-[var(--muted)] rounded-full">
                      {channelLabels[ticketChannel.type as keyof typeof channelLabels] ?? ticketChannel.type}
                    </span>
                  )}
                </div>
              </div>
              {ticketContact && (
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold">
                    {initials(ticketContact.full_name)}
                  </div>
                  <div className="text-right">
                    <Link
                      href={`/contacts/${ticketContact.id}`}
                      className="text-sm font-medium hover:text-[var(--primary)]"
                    >
                      {ticketContact.full_name}
                    </Link>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Creado {formatDate(ticket.created_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <ConversationPane
            ticketId={ticket.id}
            initialMessages={messages}
            currentUserHint={ticket.assignee_id}
            templates={templates}
          />
        </Card>

        {/* Sidebar derecho */}
        <div className="space-y-4">
          <TicketSidebar
            ticketId={ticket.id}
            currentStatus={ticket.status}
            currentAssignee={ticket.assignee_id}
            members={members}
          />

          {ticketContact && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ticketContact.email && (
                  <a
                    href={`mailto:${ticketContact.email}`}
                    className="flex items-center gap-2 text-sm hover:text-[var(--primary)]"
                  >
                    <Mail className="h-4 w-4" />
                    {ticketContact.email}
                  </a>
                )}
                {ticketContact.whatsapp && (
                  <a
                    href={`https://wa.me/${ticketContact.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-emerald-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {ticketContact.whatsapp}
                  </a>
                )}
                {ticketContact.phone && (
                  <a
                    href={`tel:${ticketContact.phone}`}
                    className="flex items-center gap-2 text-sm hover:text-[var(--primary)]"
                  >
                    <Phone className="h-4 w-4" />
                    {ticketContact.phone}
                  </a>
                )}
                <Link href={`/contacts/${ticketContact.id}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Ver ficha completa
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tareas
              </CardTitle>
              <Link href={`/tasks/new?relatedType=ticket&relatedId=${ticket.id}`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {relatedTasks.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)] text-center py-3">
                  Sin tareas para este ticket
                </p>
              ) : (
                <ul className="space-y-2">
                  {relatedTasks.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/tasks/${t.id}`}
                        className="block hover:bg-[var(--muted)] rounded p-2 -mx-2"
                      >
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <TaskStatusBadge status={t.status} />
                          {t.due_at && (
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {formatRelative(t.due_at)}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Notas internas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotesSection
                notes={notes}
                relatedType="ticket"
                relatedId={ticket.id}
                currentUserId={user.id}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
