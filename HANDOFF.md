# HANDOFF — Sprint 1 v2 (modo autónomo)

> Documento vivo. Se actualiza en cada commit grande del trabajo overnight del 2026-04-30 al 2026-05-01.

## Estado al iniciar

- **Branch:** `v2-equipo-comercial-digital`
- **Producción (main):** `https://allinchile.vercel.app` v1.0-mvp tag (commit `a450402`)
- **Snapshot read-only:** `~/Desktop/allinchile-v1-snapshot-2026-04-30/`

## Cuando despiertes — checklist (5-10 min)

> Esta sección se mantiene actualizada. Lo que está marcado es lo que falta SOLO de ti.

### 🔴 Bloqueantes (sin esto nada del trabajo nuevo se activa)

#### 1. Aplicar migraciones SQL en Supabase Dashboard
URL: https://supabase.com/dashboard/project/xnfufbctcmeltcsxohpk/sql/new

Aplicar en orden, una a la vez (Cmd+A → Delete → Cmd+V → Run):

- [ ] `supabase/migrations/0007_consent_and_ai_logs.sql` — campos consentimiento en contacts + tabla ai_logs
- [ ] `supabase/migrations/0008_audit_log_triggers.sql` — triggers automáticos en contacts/companies/deals/tickets/tasks
- [ ] (más migraciones aparecerán aquí según avance la noche)

#### 2. Crear cuentas en servicios externos
Cada una toma 2-5 minutos:

- [ ] **Sentry** (https://sentry.io) — plan Developer gratis. Crear proyecto Next.js, copiar DSN.
- [ ] **PostHog** (https://posthog.com) — plan Free hasta 1M events/mes. Copiar Project API Key + Host (US o EU).
- [ ] **360dialog** (https://hub.360dialog.com/signup) — DEFERIDO a Sprint 2. No urgente esta noche.

#### 3. Setear env vars en Vercel
URL: https://vercel.com/sebastiantirado1978-designs-projects/allinchile/settings/environment-variables

Agregar (Production + Preview):

- [ ] `NEXT_PUBLIC_SENTRY_DSN` = (DSN de Sentry)
- [ ] `SENTRY_AUTH_TOKEN` = (auth token de Sentry para sourcemaps)
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` = (project key de PostHog)
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` = `https://us.i.posthog.com` (o EU según elección)

Después: **Redeploy** del último commit en branch `v2-equipo-comercial-digital`.

### 🟡 Revisión (no bloqueante pero recomendado)

- [ ] Revisar `app/legal/privacy/page.tsx` con tu abogado. Template alineado a Ley 21.719 + 19.628 con secciones ARCOPOL, subprocesadores, decisiones automatizadas e IA. Incluye email `privacidad@allinchile.cl` (que aún no existe — crear cuando tengas dominio).
- [ ] Revisar `app/legal/terms/page.tsx` con abogado. Cubre planes/precios, uso aceptable, propiedad de datos, limitación de responsabilidad, IA, ley chilena, jurisdicción Santiago.
- [ ] Revisar `app/pricing/page.tsx`. Precios actuales: Starter $89k / Pro $185k / Business $390k + IVA. FAQ con 7 preguntas. Setup fee opcional Business $250k.
- [ ] Aprobar el OG image generado y el favicon (Iter 7).

## Trabajo realizado esta noche (commits)

> Lista actualizada en cada commit grande. Ver `git log` para detalle.

- `3df8c9a` — chore(v2): inicio Sprint 1 — HANDOFF.md + migración 0007
- `ccc19a2` — feat(v2): triggers SQL de audit log en entidades de negocio
- `a62aab4` — feat(v2): persistencia de logs IA en /api/ai/rewrite
- `<pending>` — feat(v2): páginas legales privacy/terms + pricing

## Decisiones tomadas autónomas (te las cuento por transparencia)

(Se va llenando)

## Bloqueadores encontrados (donde paré y por qué)

(Si llego a algo que requiere tu input, queda anotado acá)

## Próximos pasos cuando me despiertes mañana

1. Revisar este HANDOFF.md completo.
2. Hacer el checklist bloqueante de arriba.
3. Decirme "sigamos" en el chat.
4. Arrancamos Sprint 2 (cotizador + agenda + WhatsApp BSP).

---
**Última actualización:** 2026-04-30 20:31 Chile · Iter 1 — inicio
