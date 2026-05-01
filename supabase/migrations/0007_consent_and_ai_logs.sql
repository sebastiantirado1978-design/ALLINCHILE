-- ============================================================================
-- ALLINCHILE — Migration 0007: consentimiento (Ley 21.719) + logs de IA
-- ============================================================================
-- 1. Campos de consentimiento en contacts:
--    - consent_given_at: cuándo el contacto autorizó ser contactado.
--    - consent_source: por dónde dió el consentimiento (web_form, import,
--      whatsapp_inbound, etc.) — texto libre para flexibilidad.
--    - unsubscribed_at: si pidió ser dado de baja.
--    - unsubscribe_token: UUID público para link "darse de baja" en emails.
--
-- 2. Tabla ai_logs:
--    Persiste cada interacción con el copiloto IA. Necesario para auditoría,
--    debugging, control de costos y eventual retraining/eval.
--    Solo service_role escribe (los endpoints de IA usan service role).
--    Miembros de la org pueden leer sus propios logs.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CONTACTS — campos de consentimiento
-- ----------------------------------------------------------------------------
alter table contacts
  add column if not exists consent_given_at timestamptz,
  add column if not exists consent_source text,
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists unsubscribe_token uuid unique default uuid_generate_v4();

-- Índice para lookups por token (página pública /unsubscribe/[token])
create index if not exists contacts_unsubscribe_token_idx
  on contacts(unsubscribe_token)
  where unsubscribe_token is not null;

-- Backfill: contactos que ya existen reciben consent_given_at = created_at
-- bajo la suposición razonable de que fueron creados intencionalmente por
-- el dueño de la org (no scrapeados). Se puede revisar caso por caso después.
update contacts
  set consent_given_at = created_at,
      consent_source = 'pre_existing'
  where consent_given_at is null;

comment on column contacts.consent_given_at is
  'Timestamp de cuando el contacto autorizó ser contactado (Ley 21.719). NULL = sin consentimiento explícito.';
comment on column contacts.consent_source is
  'Origen del consentimiento: web_form | import_csv | whatsapp_inbound | manual | pre_existing.';
comment on column contacts.unsubscribed_at is
  'Si el contacto pidió ser dado de baja. NULL = activo.';
comment on column contacts.unsubscribe_token is
  'Token UUID público para el link "darse de baja" en emails/WhatsApp.';

-- ----------------------------------------------------------------------------
-- 2. AI_LOGS — auditoría de interacciones con copiloto IA
-- ----------------------------------------------------------------------------
create table if not exists ai_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Endpoint y acción
  endpoint text not null,            -- 'rewrite' | 'agent' | 'rag' | etc
  action text,                       -- para rewrite: 'improve' | 'tone_friendly' | etc

  -- Contenido
  input_text text not null,
  output_text text,

  -- Modelo
  model text not null,               -- 'claude-sonnet-4-6' | etc
  input_tokens integer default 0,
  output_tokens integer default 0,
  cache_read_tokens integer default 0,
  cache_creation_tokens integer default 0,

  -- Status
  error text,                        -- mensaje de error si la llamada falló
  duration_ms integer,               -- tiempo total de la llamada

  -- Contexto opcional para trazabilidad
  ticket_id uuid references tickets(id) on delete set null,
  context_json jsonb,                -- parámetros adicionales (p.ej. context messages)

  created_at timestamptz default now()
);

create index if not exists ai_logs_org_created_idx
  on ai_logs(organization_id, created_at desc);
create index if not exists ai_logs_user_created_idx
  on ai_logs(user_id, created_at desc);
create index if not exists ai_logs_ticket_idx
  on ai_logs(ticket_id) where ticket_id is not null;

-- ----------------------------------------------------------------------------
-- RLS para ai_logs
-- ----------------------------------------------------------------------------
alter table ai_logs enable row level security;

-- SELECT: miembros de la org pueden leer logs de su org
create policy "ai_logs_org_select" on ai_logs for select
  using (is_org_member(organization_id));

-- INSERT/UPDATE/DELETE: solo via service_role (los endpoints de IA bypasean RLS).
-- Sin policy de insert para usuarios autenticados.

comment on table ai_logs is
  'Log de cada llamada a la API de IA. Auditoría legal, debugging, control de costo.';
