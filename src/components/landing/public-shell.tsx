import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          ALLIN<span className="text-[var(--accent)]">CHILE</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link href="/#features" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Producto
          </Link>
          <Link href="/pricing" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Precios
          </Link>
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
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-white py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
        <div>
          <Link href="/" className="font-bold tracking-tight">
            ALLIN<span className="text-[var(--accent)]">CHILE</span>
          </Link>
          <span className="ml-3">© 2026</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/legal/privacy" className="hover:text-[var(--foreground)]">
            Privacidad
          </Link>
          <Link href="/legal/terms" className="hover:text-[var(--foreground)]">
            Términos
          </Link>
          <Link href="/pricing" className="hover:text-[var(--foreground)]">
            Precios
          </Link>
          <Link href="/help" className="hover:text-[var(--foreground)]">
            Ayuda
          </Link>
        </div>
      </div>
    </footer>
  );
}
