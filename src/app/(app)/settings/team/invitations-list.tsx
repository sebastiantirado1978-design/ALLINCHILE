"use client";

import { useState, useTransition } from "react";
import { Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils";
import { revokeInvitationAction } from "@/server/actions/settings";

type Invitation = {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string | null;
  created_at: string;
};

export function InvitationsList({ invitations }: { invitations: Invitation[] }) {
  const [pending, start] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyLink(token: string, id: string) {
    const url = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link copiado");
    setTimeout(() => setCopiedId(null), 2500);
  }

  function revoke(id: string) {
    if (!confirm("¿Revocar esta invitación? El link dejará de funcionar.")) return;
    start(async () => {
      const res = await revokeInvitationAction(id);
      if (res?.error) toast.error(res.error);
      else toast.success("Invitación revocada");
    });
  }

  return (
    <ul className="divide-y divide-[var(--border)] -mt-2">
      {invitations.map((inv) => (
        <li key={inv.id} className="py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{inv.email}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Rol: <strong className="capitalize">{inv.role}</strong> · Enviada{" "}
              {formatRelative(inv.created_at)}
              {inv.expires_at && ` · Expira ${formatRelative(inv.expires_at)}`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyLink(inv.token, inv.id)}
          >
            {copiedId === inv.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedId === inv.id ? "Copiado" : "Copiar link"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => revoke(inv.id)}
            loading={pending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
