"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import { removeMemberAction, updateMemberRoleAction } from "@/server/actions/settings";

type Member = {
  id: string;
  role: "owner" | "admin" | "manager" | "agent" | "viewer";
  user_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
};

const roleLabels = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  agent: "Agente",
  viewer: "Viewer",
};

export function TeamMembers({
  members,
  canManage,
}: {
  members: Member[];
  canManage: boolean;
}) {
  const [pending, start] = useTransition();

  function changeRole(membershipId: string, role: string) {
    start(async () => {
      const res = await updateMemberRoleAction(membershipId, role);
      if (res?.error) toast.error(res.error);
      else toast.success("Rol actualizado");
    });
  }

  function remove(membershipId: string, name: string) {
    if (!confirm(`¿Quitar a ${name} de la organización?`)) return;
    start(async () => {
      const res = await removeMemberAction(membershipId);
      if (res?.error) toast.error(res.error);
      else toast.success("Miembro removido");
    });
  }

  return (
    <ul className="divide-y divide-[var(--border)] -mt-2">
      {members.map((m) => {
        const name = m.profiles.full_name ?? m.profiles.email;
        return (
          <li key={m.id} className="py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
              {initials(name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">{m.profiles.email}</p>
            </div>

            {m.role === "owner" || !canManage ? (
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--muted)] capitalize">
                {roleLabels[m.role]}
              </span>
            ) : (
              <select
                value={m.role}
                onChange={(e) => changeRole(m.id, e.target.value)}
                disabled={pending}
                className="h-9 px-2 rounded-md border border-[var(--input)] bg-white text-sm"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="agent">Agente</option>
                <option value="viewer">Viewer</option>
              </select>
            )}

            {canManage && m.role !== "owner" && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => remove(m.id, name)}
                loading={pending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
