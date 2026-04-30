import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/app/stat-card";
import { Users, Inbox, Briefcase, TrendingUp } from "lucide-react";
import { getCurrentOrg } from "@/server/queries/me";
import { getReportsData } from "@/server/queries/reports";
import { formatCurrency } from "@/lib/utils";
import {
  ActivityChart,
  ContactsByStatusChart,
  DealsByStageChart,
  TasksByAssigneeChart,
  TicketsByChannelChart,
  TicketsByStatusChart,
} from "./charts";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const data = await getReportsData(org.id);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Métricas en tiempo real de tu organización.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Contactos totales"
          value={data.totals.contacts}
          icon={Users}
          tone="accent"
        />
        <StatCard
          label="Tickets totales"
          value={data.totals.tickets}
          icon={Inbox}
          tone="default"
        />
        <StatCard
          label="Oportunidades activas"
          value={data.totals.activeDeals}
          icon={Briefcase}
          tone="warning"
        />
        <StatCard
          label="Pipeline"
          value={formatCurrency(data.totals.activeDealsValue)}
          icon={TrendingUp}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contactos por estado</CardTitle>
            <CardDescription>Distribución de tu base</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactsByStatusChart data={data.contactStatusCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets por estado</CardTitle>
            <CardDescription>Carga del equipo de soporte</CardDescription>
          </CardHeader>
          <CardContent>
            <TicketsByStatusChart data={data.ticketStatusCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets por canal</CardTitle>
            <CardDescription>Por dónde llegan más conversaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <TicketsByChannelChart data={data.ticketChannelCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tareas por responsable</CardTitle>
            <CardDescription>Carga del equipo</CardDescription>
          </CardHeader>
          <CardContent>
            <TasksByAssigneeChart data={data.tasksAssigneeData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pipeline por etapa</CardTitle>
            <CardDescription>Valor estimado distribuido en el pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <DealsByStageChart data={data.dealsStageData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad de los últimos 14 días</CardTitle>
            <CardDescription>Acciones registradas en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart data={data.activityData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
