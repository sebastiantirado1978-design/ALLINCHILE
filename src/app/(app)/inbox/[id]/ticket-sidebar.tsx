"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  assignTicketAction,
  deleteTicketAction,
  updateTicketStatusAction,
} from "@/server/actions/tickets";
import { ticketStatusValues, ticketStatusLabels } from "@/lib/validations/ticket";

export function TicketSidebar({
  ticketId,
  currentStatus,
  currentAssignee,
  members,
}: {
  ticketId: string;
  currentStatus: string;
  currentAssignee: string | null;
  members: { id: string; full_name: string | null; email: string }[];
}) {
  const [pending, start] = useTransition();

  function changeStatus(value: string) {
    start(async () => {
      const res = await updateTicketStatusAction(
        ticketId,
        value as (typeof ticketStatusValues)[number],
      );
      if (res?.error) toast.error(res.error);
      else toast.success("Estado actualizado");
    });
  }

  function changeAssignee(value: string) {
    start(async () => {
      const res = await assignTicketAction(ticketId, value || null);
      if (res?.error) toast.error(res.error);
      else toast.success(value ? "Asignado" : "Desasignado");
    });
  }

  async function onDelete() {
    if (!confirm("¿Eliminar este ticket? Esta acción no se puede deshacer.")) return;
    start(async () => {
      const res = await deleteTicketAction(ticketId);
      if (res?.error) toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Acciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="status-select" className="text-xs">Estado</Label>
          <select
            id="status-select"
            value={currentStatus}
            onChange={(e) => changeStatus(e.target.value)}
            disabled={pending}
            className="h-9 w-full px-2 rounded-md border border-[var(--input)] bg-white text-sm"
          >
            {ticketStatusValues.map((s) => (
              <option key={s} value={s}>{ticketStatusLabels[s]}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="assignee-select" className="text-xs">Asignado a</Label>
          <select
            id="assignee-select"
            value={currentAssignee ?? ""}
            onChange={(e) => changeAssignee(e.target.value)}
            disabled={pending}
            className="h-9 w-full px-2 rounded-md border border-[var(--input)] bg-white text-sm"
          >
            <option value="">Sin asignar</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name ?? m.email}</option>
            ))}
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full text-red-600 hover:bg-red-50 border-red-200"
          onClick={onDelete}
          loading={pending}
        >
          <Trash2 className="h-4 w-4" />
          Eliminar ticket
        </Button>
      </CardContent>
    </Card>
  );
}
