import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductMockup } from "@/components/landing/product-mockup";
import {
  LogosBar,
  HowItWorks,
  FeaturesGrid,
  UseCases,
  Pricing,
  Faq,
  FinalCta,
  LandingFooter,
} from "@/components/landing/sections";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            ALLIN<span className="text-[var(--accent)]">CHILE</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <a href="#features" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Producto
            </a>
            <a href="#pricing" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Precios
            </a>
            <a href="#faq" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              FAQ
            </a>
            <Link href="/help" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
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
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, #06b6d433 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, #0ea5e933 0%, transparent 60%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 lg:pt-28 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium mb-6">
            <Sparkles className="h-3 w-3" />
            Plataforma chilena con Copiloto IA
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Todo el negocio ordenado en{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              una sola plataforma
            </span>
          </h1>
          <p className="mt-6 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Clientes, ventas, atención y seguimiento conectados en tiempo real.
            <br className="hidden sm:block" />
            Pensado para empresas chilenas que necesitan operar rápido y vender mejor.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Hablar con un asesor
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            Sin tarjeta · Sin compromiso · Implementación en menos de 7 días
          </p>
        </div>

        {/* Product mockup */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <div className="relative">
            <ProductMockup />
            <div
              className="absolute -inset-x-12 -bottom-8 h-32 -z-10 blur-3xl opacity-40"
              style={{
                background: "linear-gradient(90deg, var(--primary), var(--accent))",
              }}
            />
          </div>
        </div>
      </section>

      <LogosBar />
      <HowItWorks />
      <FeaturesGrid />
      <UseCases />
      <Pricing />
      <Faq />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
