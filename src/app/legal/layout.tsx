import type { ReactNode } from "react";
import { PublicHeader, PublicFooter } from "@/components/landing/public-shell";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <article className="max-w-3xl mx-auto px-6 py-16 prose prose-neutral prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-h3:text-lg prose-p:text-[var(--muted-foreground)] prose-a:text-[var(--accent)] prose-strong:text-[var(--foreground)]">
        {children}
      </article>
      <PublicFooter />
    </div>
  );
}
