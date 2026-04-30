import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Users, MessageSquareText } from "lucide-react";
import { getCurrentOrg } from "@/server/queries/me";
import { getMyRole } from "@/server/queries/settings";

export const dynamic = "force-dynamic";

const tabs = [
  { href: "/settings", label: "General", icon: Building2 },
  { href: "/settings/team", label: "Equipo", icon: Users },
  { href: "/settings/templates", label: "Plantillas", icon: MessageSquareText },
];

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");
  await getMyRole(org.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Gestiona tu organización, equipo y plantillas.
        </p>
      </div>

      <nav className="flex gap-1 border-b border-[var(--border)] overflow-x-auto">
        {tabs.map((t) => (
          <SettingsTab key={t.href} href={t.href} label={t.label} icon={t.icon} />
        ))}
      </nav>

      <div>{children}</div>
    </div>
  );
}

function SettingsTab({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Building2;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:text-[var(--foreground)] text-[var(--muted-foreground)] flex items-center gap-2 -mb-px hover:border-[var(--border)]"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
