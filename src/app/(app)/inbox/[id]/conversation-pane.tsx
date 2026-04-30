"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import { Send, Lock, MessageSquare, Sparkles, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { cn, formatRelative } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { postMessageAction } from "@/server/actions/tickets";

type Msg = {
  id: string;
  sender_type: string;
  sender_id: string | null;
  body: string | null;
  is_internal: boolean;
  created_at: string;
};

type Template = {
  id: string;
  title: string;
  body: string;
  shortcut: string | null;
};

type AiAction = "improve" | "tone_friendly" | "tone_formal" | "shorten" | "expand";

export function ConversationPane({
  ticketId,
  initialMessages,
  currentUserHint,
  templates,
}: {
  ticketId: string;
  initialMessages: Msg[];
  currentUserHint: string | null;
  templates: Template[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [pending, start] = useTransition();
  const [aiPending, startAi] = useTransition();
  const [showTemplates, setShowTemplates] = useState(false);
  const [shortcutQuery, setShortcutQuery] = useState<string | null>(null);
  const [shortcutIndex, setShortcutIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detecta si el cuerpo termina con un /atajo (al inicio o después de espacio/salto)
  const shortcutMatches = useMemo(() => {
    if (shortcutQuery === null) return [] as Template[];
    const q = shortcutQuery.toLowerCase();
    return templates
      .filter((t) => t.shortcut && t.shortcut.toLowerCase().startsWith(`/${q}`))
      .slice(0, 5);
  }, [shortcutQuery, templates]);

  function onBodyChange(value: string) {
    setBody(value);
    // Buscar el último token que empiece con / al final del cuerpo
    const match = value.match(/(?:^|\s)\/([a-z0-9_-]*)$/i);
    if (match) {
      setShortcutQuery(match[1] ?? "");
      setShortcutIndex(0);
    } else {
      setShortcutQuery(null);
    }
  }

  function applyShortcut(t: Template) {
    if (!t.shortcut) return;
    // Reemplazar el último /xxx por el body de la plantilla
    const newBody = body.replace(/(?:^|\s)\/([a-z0-9_-]*)$/i, (full) => {
      const prefix = full.startsWith(" ") ? " " : "";
      return prefix + t.body;
    });
    setBody(newBody);
    setShortcutQuery(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function send() {
    const trimmed = body.trim();
    if (!trimmed) return;

    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      sender_type: "agent",
      sender_id: currentUserHint,
      body: trimmed,
      is_internal: isInternal,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setBody("");

    start(async () => {
      const res = await postMessageAction(ticketId, { body: trimmed, is_internal: isInternal });
      if (res?.error) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        toast.error(res.error);
        setBody(trimmed);
      }
    });
  }

  function insertTemplate(t: Template) {
    setBody((prev) => (prev ? `${prev}\n${t.body}` : t.body));
    setShowTemplates(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  async function runAi(action: AiAction) {
    if (!body.trim()) {
      toast.error("Escribe primero algo para mejorar");
      return;
    }
    startAi(async () => {
      try {
        const res = await fetch("/api/ai/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: body,
            action,
            context: messages.slice(-5).map((m) => ({
              from: m.sender_type,
              text: m.body,
            })),
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Error del copiloto");
        }
        const data = (await res.json()) as { text: string };
        setBody(data.text);
        toast.success("Texto reescrito");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error del copiloto");
      }
    });
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Mensajes */}
      <div className="flex-1 p-6 space-y-3 overflow-y-auto bg-[var(--muted)]/30 max-h-[500px] min-h-[300px]">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-[var(--muted-foreground)] py-12">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Aún no hay mensajes en este ticket
          </div>
        ) : (
          messages.map((m) => {
            const fromAgent = m.sender_type === "agent" || m.sender_type === "bot";
            return (
              <div
                key={m.id}
                className={cn("flex", fromAgent ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    m.is_internal
                      ? "bg-amber-100 text-amber-900 border border-amber-200"
                      : fromAgent
                        ? "bg-emerald-500 text-white"
                        : "bg-white border border-[var(--border)]",
                  )}
                >
                  {m.is_internal && (
                    <p className="text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1 mb-1 opacity-80">
                      <Lock className="h-3 w-3" /> Nota interna
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1 text-right",
                      fromAgent && !m.is_internal ? "text-white/80" : "text-[var(--muted-foreground)]",
                    )}
                  >
                    {formatRelative(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-[var(--border)] p-3 bg-white relative">
        {/* Autocomplete de /atajos */}
        {shortcutQuery !== null && shortcutMatches.length > 0 && (
          <div className="absolute bottom-full mb-2 left-3 right-3 bg-white rounded-lg border border-[var(--border)] shadow-lg overflow-hidden z-20">
            <div className="px-3 py-1.5 text-xs text-[var(--muted-foreground)] bg-[var(--muted)] border-b border-[var(--border)] flex justify-between">
              <span>Plantillas (/{shortcutQuery})</span>
              <span>↑↓ navegar · Tab/Enter insertar</span>
            </div>
            <ul>
              {shortcutMatches.map((t, i) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setShortcutIndex(i)}
                    onClick={() => applyShortcut(t)}
                    className={cn(
                      "w-full text-left px-3 py-2 flex items-start gap-2 transition-colors",
                      i === shortcutIndex ? "bg-cyan-50" : "hover:bg-[var(--muted)]/50",
                    )}
                  >
                    <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-[var(--muted)] shrink-0 mt-0.5">
                      {t.shortcut}
                    </code>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                        {t.body}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showTemplates && (
          <div className="absolute bottom-full mb-2 left-3 right-3 bg-white rounded-lg border border-[var(--border)] shadow-lg max-h-64 overflow-y-auto z-10">
            {templates.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                No tienes plantillas aún. Créalas desde Configuración → Plantillas.
              </p>
            ) : (
              <ul>
                {templates.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => insertTemplate(t)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[var(--muted)] flex items-start gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{t.title}</span>
                          {t.shortcut && (
                            <code className="text-xs px-1 rounded bg-[var(--muted)] font-mono">
                              {t.shortcut}
                            </code>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
                          {t.body}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            onKeyDown={(e) => {
              // Navegación del autocomplete de plantillas
              if (shortcutQuery !== null && shortcutMatches.length > 0) {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setShortcutIndex((i) => Math.min(i + 1, shortcutMatches.length - 1));
                  return;
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setShortcutIndex((i) => Math.max(i - 1, 0));
                  return;
                }
                if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey)) {
                  e.preventDefault();
                  applyShortcut(shortcutMatches[shortcutIndex]);
                  return;
                }
                if (e.key === "Escape") {
                  setShortcutQuery(null);
                  return;
                }
              }
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                send();
              }
            }}
            rows={3}
            placeholder={isInternal ? "Escribe una nota interna (no la verá el cliente)..." : "Escribe tu respuesta o /atajo para insertar plantilla..."}
            className={cn(
              "flex-1 resize-none px-3 py-2 rounded-md border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              isInternal ? "bg-amber-50 border-amber-200" : "bg-white border-[var(--input)]",
            )}
          />
          <Button onClick={send} loading={pending} disabled={!body.trim()}>
            <Send className="h-4 w-4" />
            Enviar
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setShowTemplates((s) => !s)}
              className="h-7 px-2 rounded-md text-xs flex items-center gap-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            >
              <MessageSquareText className="h-3.5 w-3.5" />
              Plantillas
            </button>

            <div className="h-4 w-px bg-[var(--border)] mx-1" />

            <AiButton onClick={() => runAi("improve")} pending={aiPending}>
              <Sparkles className="h-3.5 w-3.5" />
              Mejorar
            </AiButton>
            <AiButton onClick={() => runAi("tone_friendly")} pending={aiPending}>
              😊 Tono cordial
            </AiButton>
            <AiButton onClick={() => runAi("tone_formal")} pending={aiPending}>
              👔 Tono formal
            </AiButton>
            <AiButton onClick={() => runAi("shorten")} pending={aiPending}>
              ✂️ Acortar
            </AiButton>
            <AiButton onClick={() => runAi("expand")} pending={aiPending}>
              📖 Expandir
            </AiButton>
          </div>

          <label className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded"
            />
            Nota interna
          </label>
        </div>
      </div>
    </div>
  );
}

function AiButton({
  children,
  onClick,
  pending,
}: {
  children: React.ReactNode;
  onClick: () => void;
  pending: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="h-7 px-2 rounded-md text-xs flex items-center gap-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-50"
    >
      {children}
    </button>
  );
}
