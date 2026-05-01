import { createAdminClient } from "@/lib/supabase/admin";

export type AiLogInput = {
  organizationId: string;
  userId: string;
  endpoint: string;          // 'rewrite' | 'agent' | 'rag' | etc
  action?: string;           // 'improve' | 'tone_friendly' | etc
  inputText: string;
  outputText?: string | null;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
  error?: string | null;
  durationMs?: number;
  ticketId?: string | null;
  context?: Record<string, unknown> | null;
};

/**
 * Persiste una entrada en la tabla ai_logs. No-op silencioso si falla:
 * el log no debe romper el flujo de IA. Service-role bypass de RLS.
 *
 * Idealmente se llama con `void logAi(...)` o `await` con try/catch.
 */
export async function logAi(entry: AiLogInput): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("ai_logs").insert({
      organization_id: entry.organizationId,
      user_id: entry.userId,
      endpoint: entry.endpoint,
      action: entry.action ?? null,
      input_text: entry.inputText,
      output_text: entry.outputText ?? null,
      model: entry.model,
      input_tokens: entry.inputTokens ?? 0,
      output_tokens: entry.outputTokens ?? 0,
      cache_read_tokens: entry.cacheReadTokens ?? 0,
      cache_creation_tokens: entry.cacheCreationTokens ?? 0,
      error: entry.error ?? null,
      duration_ms: entry.durationMs ?? null,
      ticket_id: entry.ticketId ?? null,
      context_json: entry.context ?? null,
    });
  } catch (err) {
    console.error("[ai-logger] failed to persist ai_log entry:", err);
  }
}
