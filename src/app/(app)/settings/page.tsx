import { redirect } from "next/navigation";
import { getCurrentOrg } from "@/server/queries/me";
import { getOrganization, getMyRole } from "@/server/queries/settings";
import { OrgSettingsForm } from "./org-settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsGeneralPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const [organization, role] = await Promise.all([
    getOrganization(org.id),
    getMyRole(org.id),
  ]);
  if (!organization) redirect("/dashboard");

  const canEdit = role === "owner" || role === "admin";

  return (
    <OrgSettingsForm
      canEdit={canEdit}
      initial={{
        name: organization.name,
        industry: organization.industry ?? "",
        country: organization.country ?? "CL",
        primary_color: organization.primary_color ?? "#0EA5E9",
        logo_url: organization.logo_url ?? "",
      }}
    />
  );
}
