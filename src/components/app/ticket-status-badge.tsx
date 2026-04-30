import { cn } from "@/lib/utils";
import { ticketStatusLabels } from "@/lib/validations/ticket";

const styles: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  in_review: "bg-violet-50 text-violet-700 border-violet-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  waiting_customer: "bg-cyan-50 text-cyan-700 border-cyan-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export function TicketStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border",
        styles[status] ?? styles.new,
      )}
    >
      {ticketStatusLabels[status as keyof typeof ticketStatusLabels] ?? status}
    </span>
  );
}
