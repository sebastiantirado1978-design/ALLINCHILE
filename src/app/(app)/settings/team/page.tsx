import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCurrentOrg } from "@/server/queries/me";
import { listInvitations, listMembers, getMyRole } from "@/server/queries/settings";
import { TeamMembers } from "./team-members";
import { InvitationsList } from "./invitations-list";
import { InviteForm } from "./invite-form";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const [members, invitations, role] = await Promise.all([
    listMembers(org.id),
    listInvitations(org.id),
    getMyRole(org.id),
  ]);

  const canManage = role === "owner" || role === "admin";

  return (
    <div className="space-y-6">
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Invitar a tu equipo</CardTitle>
            <CardDescription>
              Envíale a tu colega un email con el link de aceptación. Si todavía no tiene cuenta,
              podrá registrarse desde ese link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteForm />
          </CardContent>
        </Card>
      )}

      {invitations.length > 0 && canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Invitaciones pendientes</CardTitle>
            <CardDescription>{invitations.length} sin aceptar</CardDescription>
          </CardHeader>
          <CardContent>
            <InvitationsList invitations={invitations} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Miembros activos</CardTitle>
          <CardDescription>
            {members.length} {members.length === 1 ? "persona" : "personas"} en {org.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMembers members={members} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
