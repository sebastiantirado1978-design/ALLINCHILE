import Link from "next/link";
import {
  MessageSquare,
  Users,
  Briefcase,
  CheckSquare,
  BarChart3,
  Sparkles,
  Zap,
  Building2,
  ShoppingBag,
  Wrench,
  GraduationCap,
  Heart,
  Plus,
  Minus,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================================================
// Section: Logos / social proof placeholder
// ============================================================================
export function LogosBar() {
  return (
    <section className="border-y border-[var(--border)] bg-white py-8">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-6">
          Empresas que confían en ALLINCHILE
        </p>
        <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap opacity-50">
          {["BlueHome", "Acme Retail", "Comercial Sur", "Distribuidora MX", "Servicios+"].map(
            (name) => (
              <div key={name} className="text-base font-semibold text-slate-400 tracking-tight">
                {name}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Section: Cómo funciona — 3 pasos
// ============================================================================
export function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Conecta tus canales",
      desc: "WhatsApp Business, email, Instagram, Facebook y chat web en 5 minutos. Todos tus mensajes en una sola bandeja.",
    },
    {
      n: "02",
      title: "Gestiona conversaciones",
      desc: "Asigna tickets al equipo, deriva a quien corresponde, marca prioridades y responde con plantillas o copiloto IA.",
    },
    {
      n: "03",
      title: "Convierte y mide",
      desc: "Cada conversación se asocia a un contacto, una empresa y una oportunidad de venta. Ves el pipeline completo en tiempo real.",
    },
  ];

  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Funciona en 3 pasos</h2>
          <p className="mt-3 text-[var(--muted-foreground)] max-w-xl mx-auto">
            Sin migraciones complejas. Sin contratos anuales. Empiezas hoy.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="text-5xl font-bold text-[var(--accent)] opacity-20">{s.n}</div>
              <h3 className="text-xl font-semibold mt-3">{s.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-7 -right-6 h-5 w-5 text-[var(--accent)]/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Section: Features (más detallada que la del hero)
// ============================================================================
export function FeaturesGrid() {
  const features = [
    {
      icon: MessageSquare,
      title: "Inbox multicanal Kanban",
      desc: "WhatsApp, email, Instagram, Facebook y chat web. Tickets organizados por estado: nuevo, en proceso, esperando cliente, resuelto.",
    },
    {
      icon: Users,
      title: "Contactos con identidad unificada",
      desc: "Si un cliente te escribe por WhatsApp e Instagram, lo identificas como una sola persona. Toda la historia en un lugar.",
    },
    {
      icon: Building2,
      title: "Empresas y contactos",
      desc: "Agrupa contactos por empresa. Visión completa del cliente B2B: ¿cuántas oportunidades, cuánto facturó, quién lo atiende?",
    },
    {
      icon: Briefcase,
      title: "CRM con pipelines arrastrables",
      desc: "Drag & drop entre etapas. Etapas configurables con probabilidad de cierre. Ganancias y pérdidas con razones.",
    },
    {
      icon: CheckSquare,
      title: "Tareas conectadas a todo",
      desc: "Crea tareas desde un contacto, oportunidad o ticket. Vencimientos, prioridades y notificaciones automáticas al equipo.",
    },
    {
      icon: Sparkles,
      title: "Copiloto IA con Claude",
      desc: "Mejora respuestas, cambia el tono, acorta o expande con un click. Plantillas con atajo /saludo en el composer.",
    },
    {
      icon: BarChart3,
      title: "Reportes en tiempo real",
      desc: "Pipeline por etapa, conversión, tickets por canal, carga del equipo. Sin Excel, sin exportar manual.",
    },
    {
      icon: Zap,
      title: "Audit log automático",
      desc: "Cada acción importante queda registrada. Quién creó, quién cambió estado, quién asignó. Trazabilidad total.",
    },
  ];
  return (
    <section className="py-24 border-t border-[var(--border)] bg-white" id="features">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Todo lo que necesitas para vender y atender
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Reemplaza tu CRM, tu helpdesk, tus hojas de cálculo y tus chats sueltos por una sola plataforma.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[var(--border)] p-6 bg-white hover:shadow-md hover:border-[var(--accent)]/40 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Section: Casos de uso por industria
// ============================================================================
export function UseCases() {
  const cases = [
    {
      icon: ShoppingBag,
      industry: "Retail / E-commerce",
      pain: "Cientos de mensajes por WhatsApp e Instagram que no logras responder a tiempo",
      gain: "Inbox multicanal Kanban + plantillas + copiloto IA. Respondes 3× más rápido.",
    },
    {
      icon: Wrench,
      industry: "Servicios / Profesionales",
      pain: "Pierdes leads porque olvidas hacer seguimiento o no recuerdas qué le ofreciste",
      gain: "CRM con próxima acción y fecha. Cada conversación queda atada al contacto y a la oportunidad.",
    },
    {
      icon: Building2,
      industry: "Inmobiliarias / Administración edificios",
      pain: "Mil grupos de WhatsApp con residentes y nada está documentado",
      gain: "Tickets por residente con historial completo. Notas internas que el equipo ve en cada interacción.",
    },
    {
      icon: GraduationCap,
      industry: "Educación / Capacitación",
      pain: "Inscripciones llegan por todos lados y se pierden en chats",
      gain: "Pipeline visual: lead → contactado → propuesta → matrícula. Métricas de conversión por canal.",
    },
    {
      icon: Heart,
      industry: "Salud / Bienestar",
      pain: "Agendamiento manual y recordatorios que se olvidan",
      gain: "Tareas con vencimiento + plantillas para confirmaciones. El equipo nunca olvida una hora.",
    },
    {
      icon: Briefcase,
      industry: "B2B / Consultoría",
      pain: "Necesitas ver el pipeline en vivo y reportar avance al equipo comercial",
      gain: "Pipeline drag & drop, reportes con gráficos en tiempo real, exportación CSV con un click.",
    },
  ];
  return (
    <section className="py-24 bg-[var(--background)] border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Hecho para tu industria</h2>
          <p className="mt-3 text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Multi-vertical desde el día 1. Si vendes algo o atiendes clientes, sirve.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div
              key={c.industry}
              className="rounded-xl bg-white border border-[var(--border)] p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                  <c.icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold">{c.industry}</h3>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1 uppercase tracking-wide">
                Antes
              </p>
              <p className="text-sm mb-4 text-slate-600">{c.pain}</p>
              <p className="text-xs text-emerald-700 mb-1 uppercase tracking-wide">Con ALLINCHILE</p>
              <p className="text-sm">{c.gain}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Section: Pricing
// ============================================================================
export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "0",
      period: "para siempre",
      tagline: "Para probar y validar",
      features: [
        "1 usuario",
        "Hasta 100 contactos",
        "Inbox multicanal básico",
        "CRM con 1 pipeline",
        "Soporte por email",
      ],
      cta: "Empezar gratis",
      highlight: false,
    },
    {
      name: "Pro",
      price: "49.900",
      period: "por usuario / mes",
      tagline: "Para equipos en crecimiento",
      features: [
        "Usuarios ilimitados",
        "Hasta 10.000 contactos",
        "Todos los canales conectados",
        "CRM con pipelines ilimitados",
        "Copiloto IA con Claude",
        "Plantillas y atajos",
        "Reportes y exportación CSV",
        "Soporte prioritario",
      ],
      cta: "Empezar ahora",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "A medida",
      period: "",
      tagline: "Para empresas con +50 usuarios",
      features: [
        "Todo lo de Pro",
        "WhatsApp Business API dedicado",
        "Integraciones a medida",
        "SLA de soporte",
        "Onboarding asistido",
        "Hosting dedicado",
      ],
      cta: "Hablar con ventas",
      highlight: false,
    },
  ];

  return (
    <section className="py-24 border-t border-[var(--border)]" id="pricing">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Precios simples, sin sorpresas
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Sin compromiso anual. Cancelas cuando quieras. Implementación gratis para los primeros 50 clientes.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                p.highlight
                  ? "rounded-2xl border-2 border-[var(--accent)] bg-white p-8 relative shadow-lg"
                  : "rounded-2xl border border-[var(--border)] bg-white p-8"
              }
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Más popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">{p.tagline}</p>
              <div className="mt-6 mb-6">
                {p.price === "A medida" ? (
                  <span className="text-3xl font-bold">A medida</span>
                ) : (
                  <>
                    <span className="text-xs align-top">CLP</span>
                    <span className="text-4xl font-bold ml-1">{p.price}</span>
                    {p.period && (
                      <span className="text-sm text-[var(--muted-foreground)] ml-2">{p.period}</span>
                    )}
                  </>
                )}
              </div>
              <ul className="space-y-2 text-sm mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[var(--success)] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.name === "Enterprise" ? "#contact" : "/signup"}>
                <Button
                  variant={p.highlight ? "default" : "outline"}
                  className="w-full"
                >
                  {p.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Section: FAQ
// ============================================================================
export function Faq() {
  const items = [
    {
      q: "¿Cuánto demora la implementación?",
      a: "Menos de 7 días. Creas tu cuenta, conectas tus canales (WhatsApp, email, redes), invitas a tu equipo y listo. Para WhatsApp Business API se requiere aprobación de Meta (5-15 días), mientras tanto puedes operar con el resto de canales.",
    },
    {
      q: "¿Necesito un equipo técnico para usarlo?",
      a: "No. Está pensado para que cualquiera del equipo comercial o de atención lo use sin saber programar. La interfaz es similar a herramientas que ya conoces como WhatsApp, Trello o Gmail.",
    },
    {
      q: "¿Mis datos están seguros?",
      a: "Sí. Cada organización tiene aislamiento completo de datos a nivel de base de datos (Row Level Security en PostgreSQL). Tu información nunca se mezcla con la de otra empresa. Hosting en infraestructura segura con certificados SSL y respaldos automáticos.",
    },
    {
      q: "¿El Copiloto IA reemplaza a mis agentes?",
      a: "No. Los asiste. El copiloto sugiere mejoras a respuestas que tu agente ya escribió: cambiar el tono, acortar, expandir, mejorar gramática. Las decisiones siempre las toma tu equipo.",
    },
    {
      q: "¿Puedo cancelar cuando quiera?",
      a: "Sí. No hay contratos anuales obligatorios. Cancelas con un click desde Configuración y conservas acceso hasta el fin del periodo facturado. Te entregamos toda tu data exportada en CSV.",
    },
    {
      q: "¿Tienen integraciones con mi ERP / sistema actual?",
      a: "Estamos preparados para integrar Shopify, HubSpot y Salesforce de forma nativa. Para otros sistemas, ofrecemos API y webhooks. Contáctanos en el plan Enterprise.",
    },
    {
      q: "¿Hay soporte en español?",
      a: "Sí. Soporte 100% en español, equipo en Chile. Atención por chat dentro de la app y email. Plan Pro tiene soporte prioritario, Enterprise tiene SLA de respuesta.",
    },
    {
      q: "¿Funciona en celular?",
      a: "Sí, la plataforma es responsive y funciona en navegador móvil. App nativa iOS/Android está en roadmap.",
    },
  ];

  return (
    <section className="py-24 border-t border-[var(--border)] bg-[var(--muted)]" id="faq">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Preguntas frecuentes</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Todo lo que necesitas saber antes de empezar.
          </p>
        </div>
        <div className="space-y-3">
          {items.map((it, i) => (
            <FaqItem key={i} q={it.q} a={it.a} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  return (
    <details
      className="rounded-xl bg-white border border-[var(--border)] group"
      open={defaultOpen}
    >
      <summary className="cursor-pointer px-5 py-4 flex items-center justify-between gap-3 list-none">
        <span className="font-medium text-sm">{q}</span>
        <Plus className="h-4 w-4 text-[var(--muted-foreground)] group-open:hidden shrink-0" />
        <Minus className="h-4 w-4 text-[var(--muted-foreground)] hidden group-open:block shrink-0" />
      </summary>
      <div className="px-5 pb-4 text-sm text-[var(--muted-foreground)] leading-relaxed">{a}</div>
    </details>
  );
}

// ============================================================================
// Section: Final CTA
// ============================================================================
export function FinalCta() {
  return (
    <section className="py-24 border-t border-[var(--border)] bg-gradient-to-br from-[var(--primary)] to-[#082f49] text-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Empieza hoy. Sin tarjeta. Sin compromiso.
        </h2>
        <p className="mt-4 text-white/80 text-lg">
          Tu equipo te lo agradecerá. Tus clientes también.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup">
            <Button size="lg" variant="accent" className="w-full sm:w-auto">
              Crear mi cuenta gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#contact">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10"
            >
              Hablar con un asesor
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Section: Footer
// ============================================================================
export function LandingFooter() {
  return (
    <footer className="bg-slate-900 text-white py-12" id="contact">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-tight">
              ALLIN<span className="text-[var(--accent)]">CHILE</span>
            </Link>
            <p className="text-sm text-slate-400 mt-3 max-w-xs">
              La plataforma chilena que centraliza ventas, atención y seguimiento en un solo lugar.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-3 font-semibold">
              Producto
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Precios</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              <li><Link href="/help" className="hover:text-white">Ayuda</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-3 font-semibold">
              Empresa
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/login" className="hover:text-white">Ingresar</Link></li>
              <li><Link href="/signup" className="hover:text-white">Crear cuenta</Link></li>
              <li><a href="mailto:hola@allinchile.cl" className="hover:text-white">Contacto</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-3 font-semibold">
              Contacto
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>hola@allinchile.cl</li>
              <li>Santiago, Chile 🇨🇱</li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ALLINCHILE. Todos los derechos reservados.</p>
          <p>Hecho en Chile con ☕ y mucho café.</p>
        </div>
      </div>
    </footer>
  );
}
