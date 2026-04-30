"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronRight, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

const STEPS: Step[] = [
  {
    id: "first_contact",
    title: "Crea tu primer contacto",
    description: "Tu base de clientes empieza aquí. Agrega un cliente, lead o prospecto.",
    href: "/contacts/new",
    cta: "Crear contacto",
  },
  {
    id: "first_company",
    title: "Agrega una empresa",
    description: "Agrupa contactos por empresa para tener visión B2B completa.",
    href: "/companies/new",
    cta: "Agregar empresa",
  },
  {
    id: "first_deal",
    title: "Registra tu primera oportunidad",
    description: "Mueve oportunidades por el pipeline visual de tu CRM.",
    href: "/deals/new",
    cta: "Crear oportunidad",
  },
  {
    id: "first_template",
    title: "Crea una plantilla de mensaje",
    description: "Respuestas rápidas con atajo /saludo para responder más rápido.",
    href: "/settings/templates",
    cta: "Crear plantilla",
  },
  {
    id: "invite_team",
    title: "Invita a tu equipo",
    description: "Atender solo no escala. Trae a tus compañeros.",
    href: "/settings/team",
    cta: "Invitar equipo",
  },
];

const STORAGE_KEY = "allinchile_onboarding_v1";

type State = {
  completed: string[];
  dismissed: boolean;
};

function loadState(): State {
  if (typeof window === "undefined") return { completed: [], dismissed: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], dismissed: false };
    return JSON.parse(raw) as State;
  } catch {
    return { completed: [], dismissed: false };
  }
}

function saveState(s: State) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function OnboardingCard({
  hasContacts,
  hasCompanies,
  hasDeals,
  firstName,
}: {
  hasContacts: boolean;
  hasCompanies: boolean;
  hasDeals: boolean;
  firstName: string;
}) {
  const [state, setState] = useState<State>({ completed: [], dismissed: false });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = loadState();
    // Marcar pasos completados según el estado real de la DB
    const auto = new Set(initial.completed);
    if (hasContacts) auto.add("first_contact");
    if (hasCompanies) auto.add("first_company");
    if (hasDeals) auto.add("first_deal");
    const next = { ...initial, completed: Array.from(auto) };
    setState(next);
    saveState(next);
    setHydrated(true);
  }, [hasContacts, hasCompanies, hasDeals]);

  function complete(id: string) {
    const next = { ...state, completed: Array.from(new Set([...state.completed, id])) };
    setState(next);
    saveState(next);
  }

  function dismiss() {
    const next = { ...state, dismissed: true };
    setState(next);
    saveState(next);
  }

  if (!hydrated) return null;

  const total = STEPS.length;
  const done = STEPS.filter((s) => state.completed.includes(s.id)).length;
  const allDone = done === total;

  if (state.dismissed || allDone) return null;

  const progress = Math.round((done / total) * 100);

  return (
    <div className="rounded-2xl border-2 border-[var(--accent)]/30 bg-gradient-to-br from-cyan-50 via-white to-white p-6 relative overflow-hidden">
      {/* Decoración */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 h-40 w-40 rounded-full bg-[var(--accent)]/5" />

      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar"
        className="absolute top-4 right-4 h-8 w-8 rounded-md hover:bg-white flex items-center justify-center text-[var(--muted-foreground)]"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--accent)] uppercase tracking-wide">
            Primeros pasos
          </p>
          <h3 className="text-lg font-bold">¡Bienvenido, {firstName}! 👋</h3>
        </div>
      </div>

      <p className="text-sm text-[var(--muted-foreground)] mb-4">
        Completa estos pasos para sacarle el jugo a ALLINCHILE en menos de 5 minutos.
      </p>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium">
            {done} de {total} completados
          </span>
          <span className="text-[var(--muted-foreground)]">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <ul className="space-y-2">
        {STEPS.map((step) => {
          const isDone = state.completed.includes(step.id);
          return (
            <li
              key={step.id}
              className={cn(
                "rounded-lg border bg-white p-3 flex items-center gap-3 transition-all",
                isDone ? "border-[var(--success)]/30 opacity-70" : "border-[var(--border)]",
              )}
            >
              <div
                className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0",
                  isDone
                    ? "bg-[var(--success)] border-[var(--success)] text-white"
                    : "border-slate-300",
                )}
              >
                {isDone && <Check className="h-3 w-3" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isDone && "line-through text-[var(--muted-foreground)]",
                  )}
                >
                  {step.title}
                </p>
                {!isDone && (
                  <p className="text-xs text-[var(--muted-foreground)]">{step.description}</p>
                )}
              </div>
              {!isDone && (
                <Link
                  href={step.href}
                  onClick={() => complete(step.id)}
                  className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-0.5 shrink-0"
                >
                  {step.cta}
                  <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex justify-between items-center text-xs text-[var(--muted-foreground)]">
        <span>💡 Tip: puedes cerrar este panel y aparecerá hasta que completes los pasos.</span>
        <button onClick={dismiss} className="hover:underline">
          Ocultar para siempre
        </button>
      </div>
    </div>
  );
}
