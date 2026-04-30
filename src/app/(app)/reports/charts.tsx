"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const colors = ["#0c4a6e", "#06b6d4", "#10b981", "#f59e0b", "#a78bfa", "#ef4444", "#94a3b8"];

const contactStatusLabels: Record<string, string> = {
  lead: "Lead",
  active: "Activo",
  inactive: "Inactivo",
  churned: "Perdido",
};

const ticketStatusLabels: Record<string, string> = {
  new: "Nuevo",
  in_review: "En revisión",
  in_progress: "En proceso",
  waiting_customer: "Esperando cliente",
  resolved: "Resuelto",
  closed: "Cerrado",
  rejected: "Rechazado",
};

export function ContactsByStatusChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([k, v]) => ({
    name: contactStatusLabels[k] ?? k,
    value: v,
  }));

  if (chartData.length === 0) {
    return <Empty msg="Sin contactos aún" />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(entry) => entry.name}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TicketsByStatusChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([k, v]) => ({
    name: ticketStatusLabels[k] ?? k,
    count: v,
  }));

  if (chartData.length === 0) return <Empty msg="Sin tickets aún" />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TicketsByChannelChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([k, v]) => ({ name: k, value: v }));
  if (chartData.length === 0) return <Empty msg="Sin canales" />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(entry) => entry.name}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DealsByStageChart({
  data,
}: {
  data: { name: string; color: string; count: number; value: number }[];
}) {
  if (data.length === 0) return <Empty msg="Sin oportunidades activas" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis
          type="number"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCurrency(v)}
        />
        <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} axisLine={false} width={130} />
        <Tooltip
          formatter={(v) => formatCurrency(typeof v === "number" ? v : Number(v) || 0)}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TasksByAssigneeChart({ data }: { data: { name: string; count: number }[] }) {
  if (data.length === 0) return <Empty msg="Sin tareas asignadas" />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#0c4a6e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ActivityChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#06b6d4"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="h-[240px] flex items-center justify-center text-sm text-[var(--muted-foreground)]">
      {msg}
    </div>
  );
}
