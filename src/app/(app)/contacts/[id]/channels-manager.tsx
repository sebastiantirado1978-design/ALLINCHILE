"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { channelLabels, channelTypeValues } from "@/lib/validations/ticket";
import {
  addContactChannelAction,
  removeContactChannelAction,
} from "@/server/actions/contact-channels";

type Channel = {
  id: string;
  channel: string;
  identifier: string;
  is_primary: boolean;
  verified: boolean;
};

export function ChannelsManager({
  contactId,
  channels,
}: {
  contactId: string;
  channels: Channel[];
}) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<(typeof channelTypeValues)[number]>("whatsapp");
  const [identifier, setIdentifier] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [pending, start] = useTransition();

  function add() {
    if (!identifier.trim()) {
      toast.error("Ingresa un identificador");
      return;
    }
    start(async () => {
      const res = await addContactChannelAction(contactId, {
        channel: type,
        identifier: identifier.trim(),
        is_primary: isPrimary,
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Canal vinculado");
        setIdentifier("");
        setIsPrimary(false);
        setAdding(false);
      }
    });
  }

  function remove(id: string) {
    if (!confirm("¿Desvincular este canal?")) return;
    start(async () => {
      const res = await removeContactChannelAction(contactId, id);
      if (res?.error) toast.error(res.error);
      else toast.success("Canal desvinculado");
    });
  }

  return (
    <div className="space-y-3">
      {channels.length === 0 && !adding && (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-6">
          Este contacto aún no tiene canales adicionales vinculados.
        </p>
      )}

      {channels.length > 0 && (
        <ul className="divide-y divide-[var(--border)] -mt-2">
          {channels.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <div className="h-8 w-8 rounded-full bg-[var(--muted)] flex items-center justify-center">
                <Link2 className="h-4 w-4 text-[var(--muted-foreground)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {channelLabels[c.channel as keyof typeof channelLabels] ?? c.channel}
                  {c.is_primary && (
                    <span className="ml-2 text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Principal
                    </span>
                  )}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">{c.identifier}</p>
              </div>
              <button
                onClick={() => remove(c.id)}
                disabled={pending}
                className="h-8 w-8 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50"
                aria-label="Desvincular"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="rounded-lg border border-[var(--border)] p-3 space-y-3 bg-[var(--muted)]/30">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="ch-type" className="text-xs">Canal</Label>
              <select
                id="ch-type"
                value={type}
                onChange={(e) => setType(e.target.value as (typeof channelTypeValues)[number])}
                className="h-9 w-full px-2 rounded-md border border-[var(--input)] bg-white text-sm"
              >
                {channelTypeValues.map((c) => (
                  <option key={c} value={c}>{channelLabels[c]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ch-id" className="text-xs">Identificador</Label>
              <Input
                id="ch-id"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="número, email, @user"
                className="h-9"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
            />
            Marcar como principal
          </label>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={add} loading={pending}>
              Vincular
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="w-full" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
          Vincular canal
        </Button>
      )}
    </div>
  );
}
