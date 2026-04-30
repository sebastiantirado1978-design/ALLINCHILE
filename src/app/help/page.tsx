import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Briefcase,
  Inbox,
  Sparkles,
  Settings,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            ALLIN<span className="text-[var(--accent)]">CHILE</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link href="/#features" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Producto
            </Link>
            <Link href="/#pricing" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Precios
            </Link>
            <Link href="/help" className="text-[var(--foreground)] font-semibold">
              Ayuda
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Ingresar</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Empezar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[var(--border)] bg-[var(--muted)]">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[var(--accent)] text-xs font-medium mb-5">
            <BookOpen className="h-3 w-3" />
            Centro de ayuda
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            ¿En qué te podemos ayudar?
          </h1>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Guías rápidas, respuestas a preguntas comunes y cómo contactar a soporte.
          </p>
        </div>
      </section>

      {/* Quick start */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Guía de inicio rápido</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-8">
            5 pasos para tener todo funcionando en menos de 10 minutos.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <QuickStep
              n={1}
              icon={Settings}
              title="Configura tu organización"
              desc="Datos de empresa, color principal, logo. Ve a Configuración → General."
              href="/settings"
            />
            <QuickStep
              n={2}
              icon={Users}
              title="Crea tus primeros contactos"
              desc="Importa o agrega manualmente. Asocia a empresas para ver el panorama B2B."
              href="/contacts"
            />
            <QuickStep
              n={3}
              icon={Briefcase}
              title="Arma tu pipeline de ventas"
              desc="El CRM viene con un pipeline de Ventas por defecto. Crea tu primera oportunidad."
              href="/deals"
            />
            <QuickStep
              n={4}
              icon={Inbox}
              title="Conecta tus canales"
              desc="WhatsApp, email, Instagram. Cada mensaje crea un ticket automáticamente."
              href="/inbox"
            />
            <QuickStep
              n={5}
              icon={Sparkles}
              title="Crea plantillas con atajos"
              desc="Define respuestas como /saludo o /precio. Aparecen autocompletadas mientras escribes."
              href="/settings/templates"
            />
            <QuickStep
              n={6}
              icon={Users}
              title="Invita a tu equipo"
              desc="Asigna roles: admin, manager, agent o viewer. Cada rol tiene permisos diferentes."
              href="/settings/team"
            />
          </div>
        </div>
      </section>

      {/* FAQ extendido */}
      <section className="py-16 bg-[var(--muted)] border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Preguntas frecuentes</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-8">
            Si no encuentras tu respuesta, escríbenos a hola@allinchile.cl.
          </p>
          <div className="space-y-3">
            <FaqItem
              q="¿Cómo conecto WhatsApp Business?"
              a="WhatsApp Business API requiere aprobación de Meta. El proceso toma 5-15 días. Mientras tanto, los botones de WhatsApp en contactos abren wa.me/[número] que funciona desde el momento cero. Cuando tengas el número Meta aprobado, lo conectas en Configuración → Integraciones."
              defaultOpen
            />
            <FaqItem
              q="¿Cómo invito a mi equipo?"
              a="Ve a Configuración → Equipo → Invitar. Ingresa el email y rol del invitado. Si tienes Resend configurado, le llega un email automático con el link de aceptación. Si no, copias el link y se lo mandas por el medio que prefieras. El link expira en 7 días."
            />
            <FaqItem
              q="¿Qué hace el Copiloto IA?"
              a="Te ayuda a redactar respuestas en tickets. Toma el borrador que escribiste y puede: mejorar la redacción, cambiar el tono (cordial o formal), acortar o expandir. Usa Claude (de Anthropic) y solo se activa cuando tú haces click. No envía nada automáticamente."
            />
            <FaqItem
              q="¿Cómo funcionan las plantillas con atajo?"
              a="En Configuración → Plantillas, defines un atajo como /saludo. Cuando escribes en el composer del ticket y tipeas /sa, aparece un autocomplete con tus plantillas que matchean. Tab o Enter para insertar. También hay un botón 'Plantillas' tradicional para verlas todas."
            />
            <FaqItem
              q="¿Cómo asocio un contacto a una empresa?"
              a="Al crear o editar un contacto, hay un selector 'Empresa' al final del primer bloque. Selecciona una empresa existente. Si la empresa no está creada todavía, ve a Empresas → Nueva empresa primero, luego vuelve al contacto."
            />
            <FaqItem
              q="¿Por qué no veo nada en Reportes?"
              a="Los reportes muestran datos reales de tu organización. Si recién creaste tu cuenta, no hay data todavía. Crea contactos, oportunidades y tickets, y los gráficos se llenan automáticamente."
            />
            <FaqItem
              q="¿Cómo elimino mi cuenta?"
              a="Por ahora, escríbenos a hola@allinchile.cl indicando tu email registrado. Procesamos la baja en 24 horas, te exportamos toda tu data en CSV antes de eliminar y la borramos definitivamente. Estamos trabajando en un botón self-service para esto."
            />
            <FaqItem
              q="¿Mis datos se quedan con ustedes si me voy?"
              a="No. Puedes exportar todos tus contactos, empresas, tickets, oportunidades y tareas como CSV en cualquier momento desde la lista correspondiente. Es tu data, te la llevas."
            />
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="py-16 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">¿No encontraste lo que buscabas?</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-8">
            Escríbenos por el canal que prefieras. Respondemos en menos de 24 horas hábiles.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            <a
              href="mailto:hola@allinchile.cl"
              className="rounded-xl border border-[var(--border)] p-6 hover:border-[var(--accent)]/40 hover:shadow-md transition-all text-left bg-white"
            >
              <Mail className="h-6 w-6 text-[var(--primary)] mb-3" />
              <p className="font-semibold">Email</p>
              <p className="text-sm text-[var(--muted-foreground)]">hola@allinchile.cl</p>
            </a>
            <a
              href="https://wa.me/56900000000?text=Hola,%20quiero%20info%20sobre%20ALLINCHILE"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-[var(--border)] p-6 hover:border-[var(--accent)]/40 hover:shadow-md transition-all text-left bg-white"
            >
              <MessageCircle className="h-6 w-6 text-emerald-600 mb-3" />
              <p className="font-semibold">WhatsApp</p>
              <p className="text-sm text-[var(--muted-foreground)]">Chat directo</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickStep({
  n,
  icon: Icon,
  title,
  desc,
  href,
}: {
  n: number;
  icon: typeof BookOpen;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[var(--border)] p-5 hover:border-[var(--accent)]/40 hover:shadow-md transition-all bg-white block group"
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-0.5">
            Paso {n}
          </p>
          <p className="font-semibold flex items-center gap-1 group-hover:text-[var(--primary)]">
            {title}
            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{desc}</p>
        </div>
      </div>
    </Link>
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
        <span className="text-[var(--muted-foreground)] group-open:rotate-45 transition-transform shrink-0 text-xl leading-none">
          +
        </span>
      </summary>
      <div className="px-5 pb-4 text-sm text-[var(--muted-foreground)] leading-relaxed">{a}</div>
    </details>
  );
}
