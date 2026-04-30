"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, ArrowRight } from "lucide-react";
import { cn, formatCurrency, formatRelative, initials } from "@/lib/utils";
import type { DealRow } from "@/server/queries/deals";

export function DealCard({ deal, dragging }: { deal: DealRow; dragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id, data: { type: "deal", deal } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdueClose =
    deal.expected_close_date &&
    !deal.is_won &&
    !deal.is_lost &&
    new Date(deal.expected_close_date) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "block bg-white rounded-lg border border-[var(--border)] p-3 cursor-grab active:cursor-grabbing hover:shadow-sm hover:border-[var(--accent)]/50 transition-all",
        dragging && "shadow-lg ring-2 ring-[var(--accent)]",
      )}
    >
      <Link
        href={`/deals/${deal.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block"
      >
        <p className="text-sm font-medium leading-snug line-clamp-2">{deal.title}</p>

        <p className="mt-1.5 text-base font-bold text-[var(--primary)]">
          {formatCurrency(deal.value_amount, deal.currency)}
        </p>

        {deal.contact && (
          <div className="flex items-center gap-2 mt-2">
            <div className="h-5 w-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[9px] font-semibold shrink-0">
              {initials(deal.contact.full_name)}
            </div>
            <p className="text-xs text-[var(--muted-foreground)] truncate">
              {deal.contact.full_name}
            </p>
          </div>
        )}

        {(deal.expected_close_date || deal.next_action) && (
          <div className="mt-2 pt-2 border-t border-[var(--border)] space-y-1">
            {deal.expected_close_date && (
              <div className={cn("flex items-center gap-1 text-xs", overdueClose ? "text-red-600 font-medium" : "text-[var(--muted-foreground)]")}>
                <Calendar className="h-3 w-3" />
                Cierre {formatRelative(deal.expected_close_date)}
              </div>
            )}
            {deal.next_action && (
              <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                <ArrowRight className="h-3 w-3" />
                <span className="truncate">{deal.next_action}</span>
              </div>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}
