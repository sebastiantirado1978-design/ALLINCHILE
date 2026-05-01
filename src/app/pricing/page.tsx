import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicHeader, PublicFooter } from "@/components/landing/public-shell";

export const metadata: Metadata = {
  title: "Precios — ALLINCHILE",
  description:
    "Tres planes simples. Desde $89.000 CLP/mes. Sin contratos. 14 días gratis sin tarjeta.",
};

type Plan = {
  name: string;
  tagline: string;
  price: string;
  priceSuffix?: string;
  highlight?: boolean;
  cta: string;
  features: string[];
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    tagline: "Para empezar a centralizar tu atención.",
    price: "$89.000",
    priceSuffix: "CLP / mes + IVA",
    cta: "Empezar gratis",
    features: [
      "Hasta 3 usuarios",
      "1 canal a elección (WhatsApp Business o Email)",
      "500 conversaciones / mes",
      "CRM básico (contactos, empresas, oportunidades)",
      "5 plantillas de respuesta rápida",
      "Reportes básicos",
      "Soporte por email (< 48h hábiles)",
    ],
  },
  {
    name: "Pro",
    tagline: "El sweet spot para PyMEs con equipo de ventas.",
    price: "$185.000",
    priceSuffix: "CLP / mes + IVA",
    highlight: true,
    cta: "Empezar prueba",
    features: [
      "Hasta 10 usuarios (+$22.000 por usuario adicional)",
      "Todos los canales: WhatsApp, Email, Instagram, Facebook, Web, SMS",
      "Conversaciones ilimitadas",
      "CRM completo + pipelines arrastrables",
      "Plantillas ilimitadas",
      "Copiloto IA con Claude — 1.000 reescrituras / mes",
      "Tareas, equipo con roles, audit log",
      "Reportes en vivo + exportación CSV",
      "Soporte prioritario (< 8h hábiles)",
    ],
  },
  {
    name: "Business",
    tagline: "Para empresas medianas con procesos serios.",
    price: "$390.000",
    priceSuffix: "CLP / mes + IVA",
    cta: "Hablar con ventas",
    features: [
      "Hasta 30 usuarios (+$18.000 por usuario adicional)",
      "Todo lo del plan Pro",
      "Copiloto IA sin límite",
      "Dominio personalizado (atencion.tuempresa.cl)",
      "Múltiples organizaciones (matriz / sucursales)",
      "API REST + webhooks salientes",
      "Audit log avanzado y exportable",
      "SLA contractual 99.9% uptime",
      "Onboarding dedicado + capacitación",
      "Account manager asignado",
      "Soporte por WhatsApp directo (< 2h hábiles)",
    ],
  },
];

const FAQ = [
  {
    q: "¿Hay contratos de permanencia?",
    a: "No. Cancelas cuando quieras. La baja se hace efectiva al final del periodo facturado.",
  },
  {
    q: "¿Cómo funciona el periodo de prueba?",
    a: "Tienes 14 días de prueba gratuita en cualquier plan, sin pedirte tarjeta de crédito. Al finalizar puedes elegir plan, pausar la cuenta o exportar tus datos.",
  },
  {
    q: "¿Hay descuento por pago anual?",
    a: "Sí. Pagando 12 meses por adelantado solo cobramos 10. Equivale a 2 meses gratis.",
  },
  {
    q: "¿Qué pasa si necesito más usuarios o más conversaciones?",
    a: "Puedes agregar usuarios adicionales al plan Pro o Business al precio indicado. Si superas el límite de conversaciones del plan Starter, te avisamos antes de cualquier cobro extra.",
  },
  {
    q: "¿Cómo es la implementación?",
    a: "El plan Starter es self-service y se configura en un par de horas con la guía de onboarding. Los planes Pro y Business incluyen soporte de implementación y capacitación. Tiempo típico: 7 días.",
  },
  {
    q: "¿Mis datos quedan en Chile?",
    a: "La plataforma corre en Vercel (CDN global) y la base de datos está en Supabase con servidores en Estados Unidos. Las transferencias se hacen bajo cláusulas estándar de protección de datos.",
  },
  {
    q: "¿Qué pasa si me canso del servicio?",
    a: "Puedes exportar tus contactos, oportunidades, tickets y notas a CSV en cualquier momento desde Configuración. Tras la baja, los datos se conservan 30 días por si te arrepientes y luego se eliminan.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium mb-6">
          PRECIOS TRANSPARENTES
        </span>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Tres planes. <span className="text-[var(--accent)]">Cero sorpresas</span>.
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
          Pagas por usuario, no por conversación. Sin contratos de permanencia.
          Sin costos ocultos. 14 días gratis para probar.
        </p>
      </section>

      {/* Plans grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={
                "rounded-2xl border bg-white p-8 flex flex-col " +
                (plan.highlight
                  ? "border-[var(--accent)] shadow-xl ring-2 ring-[var(--accent)]/20"
                  : "border-[var(--border)]")
              }
            >
              {plan.highlight && (
                <div className="inline-block self-start mb-4 px-2.5 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-bold tracking-wide">
                  MÁS POPULAR
                </div>
              )}
              <h2 className="text-2xl font-bold tracking-tight">{plan.name}</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-6">
                {plan.tagline}
              </p>
              <div className="mb-2">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mb-6">
                {plan.priceSuffix}
              </p>

              <Link href="/signup" className="block">
                <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </Link>

              <ul className="mt-8 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="size-4 mt-0.5 text-[var(--accent)] shrink-0" />
                    <span className="text-[var(--muted-foreground)]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-[var(--muted-foreground)] mt-10">
          Setup fee opcional para Business: $250.000 CLP por implementación
          asistida (importación de datos, conexión de canales, capacitación 1:1).
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold tracking-tight mb-10 text-center">
          Preguntas frecuentes
        </h2>
        <div className="space-y-6">
          {FAQ.map((item) => (
            <div key={item.q} className="border-b border-[var(--border)] pb-6">
              <h3 className="font-semibold mb-2">{item.q}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          ¿Listo para empezar?
        </h2>
        <p className="text-[var(--muted-foreground)] mb-8">
          14 días gratis. Sin tarjeta. Sin compromiso.
        </p>
        <Link href="/signup">
          <Button size="lg">Crear cuenta gratis</Button>
        </Link>
      </section>

      <PublicFooter />
    </div>
  );
}
