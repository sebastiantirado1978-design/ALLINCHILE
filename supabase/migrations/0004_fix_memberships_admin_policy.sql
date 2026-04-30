-- ============================================================================
-- ALLINCHILE — Migration 0004: eliminar policy recursiva memberships_admin_modify
-- ============================================================================
-- La policy memberships_admin_modify (FOR ALL) también hacía EXISTS sobre
-- memberships, así que aunque exista la policy self_select correcta, esta
-- policy seguía disparando la recursión cuando Postgres evaluaba ambas.
--
-- Las mutaciones de membership (INSERT/UPDATE/DELETE) se hacen vía
-- service_role (server actions y función accept_invitation con SECURITY
-- DEFINER). El cliente nunca debería modificar memberships directamente,
-- así que es seguro eliminar la policy.

drop policy if exists "memberships_admin_modify" on memberships;
