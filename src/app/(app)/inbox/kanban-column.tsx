"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { formatRelative, initials } from "@/lib/utils";
import { PriorityBadge } from "@/components/app/priority-badge";
import type { TicketRow } from "@/server/queries/tickets";

export function KanbanColumn({
  title,
  count,
  tickets,
  accent,
}: {
  title: string;
  count: number;
  tickets: TicketRow[];
  accent: string;
}) {
  return (
    <div className="flex flex-col w-[300px] shrink-0 bg-[var(--muted)] rounded-xl border border-[var(--border)]">
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-[var(--border)] sticky top-0 bg-[var(--muted)] rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${accent}`} />
          <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
        </div>
        <span className="text-xs font-medium text-[var(--muted-foreground)] bg-white px-1.5 py-0.5 rounded">
          {count}
        </span>
      </div>

      <div className="flex-1 p-2 space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
        {tickets.length === 0 ? (
          <p className="text-xs text-[var(--muted-foreground)] text-center py-6">Sin tickets</p>
        ) : (
          tickets.map((t) => (
            <Link
              key={t.id}
              href={`/inbox/${t.id}`}
              className="block bg-white rounded-lg border border-[var(--border)] p-3 hover:shadow-sm hover:border-[var(--accent)]/50 transition-all"
            >
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-2">
                <span className="font-mono">#{t.number}</span>
                {t.channel && (
                  <span className="px-1.5 py-0.5 bg-[var(--muted)] rounded capitalize">
                    {t.channel.type}
                  </span>
                )}
              </div>

              {t.contact && (
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-6 w-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {initials(t.contact.full_name)}
                  </div>
                  <p className="text-sm font-medium truncate">{t.contact.full_name}</p>
                </div>
              )}

              {t.subject && (
                <p className="text-sm text-[var(--foreground)] line-clamp-2">{t.subject}</p>
              )}

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border)]">
                <PriorityBadge priority={t.priority} />
                <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {t.last_message_at ? formatRelative(t.last_message_at) : formatRelative(t.created_at)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
