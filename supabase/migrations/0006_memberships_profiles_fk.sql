-- ============================================================================
-- ALLINCHILE — Migration 0006: FK explícito memberships → profiles
-- ============================================================================
-- listMembers (settings/team) usa el embed PostgREST:
--   .select("id, role, user_id, profiles!inner(...)")
-- Eso requiere que PostgREST conozca un foreign key directo entre las
-- tablas. Hoy memberships.user_id apunta a auth.users(id), igual que
-- profiles.id, pero PostgREST no sigue relaciones transitivas.
--
-- Agregamos un FK explícito de memberships.user_id a profiles.id. Es
-- consistente: profiles.id ES auth.users.id (mismo PK), y el trigger
-- handle_new_user crea siempre el profile antes de cualquier membership.

alter table memberships
  add constraint memberships_user_id_profile_fk
  foreign key (user_id) references profiles(id) on delete cascade;
