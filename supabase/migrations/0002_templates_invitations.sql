-- ============================================================================
-- ALLINCHILE — Migration 0002: plantillas + invitaciones
-- ============================================================================

-- ----------------------------------------------------------------------------
-- message_templates: respuestas rápidas reutilizables
-- ----------------------------------------------------------------------------
create table message_templates (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  body text not null,
  shortcut text,                    -- /saludo, /precio, etc.
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on message_templates(organization_id);
create unique index on message_templates(organization_id, shortcut) where shortcut is not null;

create trigger trg_message_templates_updated_at
  before update on message_templates
  for each row execute function set_updated_at();

alter table message_templates enable row level security;

create policy "templates_org_select" on message_templates for select
  using (exists (select 1 from memberships m where m.organization_id = message_templates.organization_id and m.user_id = auth.uid()));
create policy "templates_org_insert" on message_templates for insert
  with check (exists (select 1 from memberships m where m.organization_id = message_templates.organization_id and m.user_id = auth.uid()));
create policy "templates_org_update" on message_templates for update
  using (exists (select 1 from memberships m where m.organization_id = message_templates.organization_id and m.user_id = auth.uid()));
create policy "templates_org_delete" on message_templates for delete
  using (exists (select 1 from memberships m where m.organization_id = message_templates.organization_id and m.user_id = auth.uid() and m.role in ('owner','admin','manager')));

-- ----------------------------------------------------------------------------
-- invitations: invitar usuarios por email a una organización
-- ----------------------------------------------------------------------------
create table invitations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email citext not null,
  role membership_role not null default 'agent',
  token uuid unique default uuid_generate_v4(),
  invited_by uuid references auth.users(id),
  accepted_at timestamptz,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

create index on invitations(organization_id);
create index on invitations(email);
create index on invitations(token) where accepted_at is null;

alter table invitations enable row level security;

-- Solo owners/admins ven y crean invitaciones de su org
create policy "invitations_admin_select" on invitations for select
  using (exists (
    select 1 from memberships m
    where m.organization_id = invitations.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin')
  ));

create policy "invitations_admin_modify" on invitations for all
  using (exists (
    select 1 from memberships m
    where m.organization_id = invitations.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin')
  ))
  with check (exists (
    select 1 from memberships m
    where m.organization_id = invitations.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin')
  ));

-- ----------------------------------------------------------------------------
-- Función para aceptar una invitación: crea membership y marca aceptada
-- Se llama vía RPC desde el server action (con service role la consume).
-- ----------------------------------------------------------------------------
create or replace function accept_invitation(p_token uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_invitation invitations%rowtype;
  v_user_email citext;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  select * into v_invitation from invitations
  where token = p_token
    and accepted_at is null
    and (expires_at is null or expires_at > now())
  limit 1;

  if v_invitation.id is null then
    raise exception 'Invitación inválida o expirada';
  end if;

  select email into v_user_email from auth.users where id = auth.uid();

  if v_user_email is null or lower(v_user_email::text) <> lower(v_invitation.email::text) then
    raise exception 'Esta invitación es para otro email';
  end if;

  insert into memberships (user_id, organization_id, role)
  values (auth.uid(), v_invitation.organization_id, v_invitation.role)
  on conflict (user_id, organization_id) do update set role = excluded.role;

  update invitations set accepted_at = now() where id = v_invitation.id;

  -- Si el usuario no tenía default_org_id, ponerlo
  update profiles
  set default_org_id = v_invitation.organization_id
  where id = auth.uid() and default_org_id is null;

  return v_invitation.organization_id;
end $$;

grant execute on function accept_invitation(uuid) to authenticated;
