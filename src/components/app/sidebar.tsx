"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Inbox,
  Briefcase,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/contacts", label: "Contactos", icon: Users },
  { href: "/companies", label: "Empresas", icon: Building2 },
  { href: "/deals", label: "CRM", icon: Briefcase },
  { href: "/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
];

export function Sidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight text-white block">
          ALLIN<span className="text-[var(--accent)]">CHILE</span>
        </Link>
        <p className="text-xs text-white/50 mt-1 truncate">{orgName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-white/10 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white",
          )}
        >
          <Settings className="h-4 w-4" />
          Configuración
        </Link>

        <div className="px-3 py-2 rounded-md bg-gradient-to-br from-[var(--accent)]/20 to-transparent border border-[var(--accent)]/30">
          <div className="flex items-center gap-2 text-xs text-[var(--accent)] font-medium mb-1">
            <Sparkles className="h-3 w-3" />
            Copiloto IA
          </div>
          <p className="text-xs text-white/60">Disponible al responder tickets</p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
