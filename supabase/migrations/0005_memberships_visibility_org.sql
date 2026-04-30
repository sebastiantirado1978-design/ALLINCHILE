-- ============================================================================
-- ALLINCHILE — Migration 0005: ver miembros de tu org sin recursión RLS
-- ============================================================================
-- 0003 dejó una policy que solo permitía leer las propias memberships
-- (user_id = auth.uid()). Eso evita la recursión pero rompe la página de
-- Equipo / Settings donde un owner/admin debe ver a todos los miembros
-- de su organización.
--
-- Fix: función SECURITY DEFINER is_org_member() que bypasea RLS, y una
-- policy que la usa. La función solo expone boolean (no datos), así que
-- no abre superficie de ataque adicional.

create or replace function is_org_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships m
    where m.organization_id = p_org
      and m.user_id = auth.uid()
  )
$$;

grant execute on function is_org_member(uuid) to authenticated;

-- Reemplazar la policy restrictiva por una que use la función SECURITY DEFINER.
drop policy if exists "memberships_self_select" on memberships;

create policy "memberships_org_select" on memberships for select
  using (is_org_member(organization_id));
