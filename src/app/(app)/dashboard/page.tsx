import Link from "next/link";
import {
  Users,
  Inbox,
  Briefcase,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { OnboardingCard } from "@/components/app/onboarding-card";
import { getDashboardStats, getRecentActivity } from "@/server/queries/dashboard";
import { getCurrentOrg, getCurrentUser } from "@/server/queries/me";
import { formatCurrency, formatRelative } from "@/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const org = await getCurrentOrg();
  if (!user) redirect("/login");
  if (!org) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Sin organización</h2>
        <p className="text-[var(--muted-foreground)]">
          Tu cuenta no está asociada a ninguna organización. Contáctanos para activarla.
        </p>
      </div>
    );
  }

  const stats = await getDashboardStats(org.id);
  const activity = await getRecentActivity(org.id);

  const firstName = user.full_name?.split(" ")[0] ?? user.email.split("@")[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hola, {firstName} 👋
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Este es el resumen de actividad de <strong>{org.name}</strong>.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/contacts/new">
            <Button variant="outline">
              <Plus className="h-4 w-4" />
              Nuevo contacto
            </Button>
          </Link>
          <Link href="/deals/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nueva oportunidad
            </Button>
          </Link>
        </div>
      </div>

      {/* Onboarding (se oculta automáticamente cuando los pasos se completan o el usuario lo descarta) */}
      <OnboardingCard
        hasContacts={stats.contactsTotal > 0}
        hasCompanies={stats.companiesTotal > 0}
        hasDeals={stats.dealsTotal > 0}
        firstName={firstName}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Contactos"
          value={stats.contactsTotal}
          icon={Users}
          tone="accent"
          hint="Total registrados"
        />
        <StatCard
          label="Solicitudes nuevas"
          value={stats.newRequests}
          icon={Inbox}
          tone="warning"
          hint="Sin asignar"
        />
        <StatCard
          label="Oportunidades activas"
          value={stats.openDeals}
          icon={Briefcase}
          tone="default"
          hint={formatCurrency(stats.pipelineValue)}
        />
        <StatCard
          label="Tareas pendientes"
          value={stats.pendingTasks}
          icon={CheckSquare}
          tone={stats.overdueTasks > 0 ? "danger" : "success"}
          hint={stats.overdueTasks > 0 ? `${stats.overdueTasks} vencidas` : "Todo al día"}
        />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Pipeline comercial</CardTitle>
              <CardDescription>Valor total de oportunidades activas</CardDescription>
            </div>
            <Link href="/deals" className="text-sm text-[var(--primary)] flex items-center gap-1 hover:underline">
              Ver pipeline <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {stats.openDeals === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="Aún no tienes oportunidades"
                description="Crea tu primera oportunidad para empezar a medir tu pipeline."
                action={
                  <Link href="/deals/new">
                    <Button size="sm"><Plus className="h-4 w-4" />Nueva oportunidad</Button>
                  </Link>
                }
              />
            ) : (
              <div className="rounded-lg bg-gradient-to-br from-[var(--primary)] to-[#082f49] text-white p-6">
                <p className="text-sm text-white/70">Valor total del pipeline</p>
                <p className="text-4xl font-bold mt-2">{formatCurrency(stats.pipelineValue)}</p>
                <p className="text-sm text-white/70 mt-3">
                  Distribuido en {stats.openDeals} oportunidades activas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card>
          <CardHeader>
            <CardTitle>Atención requerida</CardTitle>
            <CardDescription>Lo que necesita tu acción ahora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.overdueTasks > 0 && (
              <AlertItem
                tone="danger"
                icon={AlertTriangle}
                title={`${stats.overdueTasks} tareas vencidas`}
                href="/tasks?filter=overdue"
              />
            )}
            {stats.newRequests > 0 && (
              <AlertItem
                tone="warning"
                icon={Inbox}
                title={`${stats.newRequests} solicitudes sin asignar`}
                href="/inbox?status=new"
              />
            )}
            {stats.overdueTasks === 0 && stats.newRequests === 0 && (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-6">
                ✨ Todo bajo control
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription>Últimos cambios en tu organización</CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] py-8 text-center">
              Sin actividad aún. Empieza creando un contacto o una oportunidad.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {activity.map((a) => (
                <li key={a.id} className="py-3 flex items-center justify-between text-sm">
                  <span>
                    <strong className="capitalize">{a.action}</strong> en{" "}
                    <span className="text-[var(--muted-foreground)]">{a.entity_type}</span>
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {formatRelative(a.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof TrendingUp;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-10">
      <div className="h-12 w-12 mx-auto rounded-full bg-[var(--muted)] flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-[var(--muted-foreground)]" />
      </div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
}

function AlertItem({
  tone,
  icon: Icon,
  title,
  href,
}: {
  tone: "danger" | "warning";
  icon: typeof AlertTriangle;
  title: string;
  href: string;
}) {
  const styles = {
    danger: "bg-red-50 text-red-700 hover:bg-red-100",
    warning: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  }[tone];
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${styles} transition-colors`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium flex-1">{title}</span>
      <ArrowUpRight className="h-3 w-3" />
    </Link>
  );
}
