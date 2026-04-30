-- ============================================================================
-- ALLINCHILE — Migration 0003: arreglar recursión infinita en memberships RLS
-- ============================================================================
-- La policy "memberships_org_select" hacía un EXISTS sobre la propia tabla
-- memberships, lo cual dispara recursión infinita en Postgres porque la
-- subquery también pasa por la misma policy.
--
-- Fix estándar: cada usuario puede leer SUS PROPIOS memberships directamente.
-- Las otras tablas siguen usando EXISTS sobre memberships, y esa subquery
-- ahora resuelve sin recursión porque la nueva policy filtra por user_id.

drop policy if exists "memberships_org_select" on memberships;

create policy "memberships_self_select" on memberships for select
  using (user_id = auth.uid());
