"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Inbox, Briefcase, CheckSquare, Building2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { globalSearchAction, type SearchHit } from "@/server/actions/search";

const iconByType = {
  contact: Users,
  company: Building2,
  ticket: Inbox,
  deal: Briefcase,
  task: CheckSquare,
} as const;

export function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pending, start] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const handle = setTimeout(() => {
      start(async () => {
        const results = await globalSearchAction(q);
        setHits(results);
        setActiveIndex(0);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [q]);

  function go(hit: SearchHit) {
    router.push(hit.href);
    setOpen(false);
    setQ("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hits[activeIndex]) {
      e.preventDefault();
      go(hits[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Buscar contactos, tickets, oportunidades, tareas..."
        className="pl-9 pr-9 bg-[var(--muted)] border-transparent"
      />
      {q && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            setHits([]);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded flex items-center justify-center text-[var(--muted-foreground)] hover:bg-white"
          aria-label="Limpiar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {open && q.length >= 2 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg border border-[var(--border)] shadow-lg overflow-hidden z-50">
          {pending && (
            <p className="px-4 py-3 text-sm text-[var(--muted-foreground)]">Buscando...</p>
          )}
          {!pending && hits.length === 0 && (
            <p className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
              Sin resultados para &ldquo;{q}&rdquo;
            </p>
          )}
          {!pending && hits.length > 0 && (
            <ul className="max-h-80 overflow-y-auto">
              {hits.map((h, i) => {
                const Icon = iconByType[h.type];
                return (
                  <li key={`${h.type}-${h.id}`}>
                    <button
                      type="button"
                      onClick={() => go(h)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors",
                        i === activeIndex ? "bg-[var(--muted)]" : "hover:bg-[var(--muted)]/50",
                      )}
                    >
                      <div className="h-8 w-8 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{h.title}</p>
                        {h.subtitle && (
                          <p className="text-xs text-[var(--muted-foreground)] truncate">
                            {h.subtitle}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">
                        {h.type}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
