-- ============================================================================
-- ALLINCHILE — Schema inicial multi-tenant
-- Postgres 15+ / Supabase
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Permite definir funciones que referencian tablas creadas más abajo
-- en este mismo script (la validación se difiere a runtime).
-- ----------------------------------------------------------------------------
set check_function_bodies = off;

-- ----------------------------------------------------------------------------
-- Extensiones
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type membership_role as enum ('owner', 'admin', 'manager', 'agent', 'viewer');
create type contact_status as enum ('lead', 'active', 'inactive', 'churned');
create type ticket_status as enum ('new', 'in_review', 'in_progress', 'waiting_customer', 'resolved', 'closed', 'rejected');
create type ticket_priority as enum ('low', 'normal', 'high', 'urgent');
create type task_status as enum ('open', 'in_progress', 'done', 'cancelled');
create type task_priority as enum ('low', 'normal', 'high', 'urgent');
create type channel_type as enum ('whatsapp', 'email', 'instagram', 'facebook', 'webchat', 'phone', 'sms', 'linkedin', 'twitter');
create type interaction_type as enum ('email', 'call', 'meeting', 'note', 'whatsapp', 'sms', 'other');
create type entity_type as enum ('contact', 'company', 'deal', 'ticket', 'task');

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Devuelve la organización activa del usuario autenticado.
-- Lee de un claim JWT 'org_id' que pondremos al elegir/crear org.
create or replace function current_org_id()
returns uuid language sql stable as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'org_id',
      current_setting('request.jwt.claims', true)::jsonb ->> 'org_id'
    ),
    ''
  )::uuid
$$;

-- Verifica si el usuario auth.uid() pertenece a una org con rol mínimo.
create or replace function has_org_role(p_org uuid, p_min_role membership_role)
returns boolean language sql stable as $$
  with role_rank as (
    select unnest(array['viewer','agent','manager','admin','owner']::membership_role[]) as role,
           generate_series(1,5) as rank
  ),
  user_role as (
    select m.role
    from memberships m
    where m.user_id = auth.uid() and m.organization_id = p_org
    limit 1
  )
  select coalesce(
    (select rr.rank from role_rank rr join user_role ur on ur.role = rr.role)
    >= (select rank from role_rank where role = p_min_role),
    false
  )
$$;

-- ============================================================================
-- TENANCY: organizations + profiles + memberships
-- ============================================================================

create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#0EA5E9',
  industry text,
  country text default 'CL',
  timezone text default 'America/Santiago',
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique not null,
  full_name text,
  avatar_url text,
  phone text,
  default_org_id uuid references organizations(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role membership_role not null default 'agent',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, organization_id)
);

create index on memberships(organization_id);
create index on memberships(user_id);

-- ============================================================================
-- TEAMS / DEPARTAMENTOS
-- ============================================================================

create table teams (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  color text default '#64748B',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id, name)
);

create table team_members (
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_lead boolean default false,
  primary key (team_id, user_id)
);

create index on teams(organization_id);

-- ============================================================================
-- COMPANIES
-- ============================================================================

create table companies (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  legal_name text,
  tax_id text,                      -- RUT en Chile
  industry text,
  website text,
  size text,                        -- '1-10', '11-50', etc.
  country text default 'CL',
  city text,
  address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create index on companies(organization_id);
create index on companies(organization_id, name);

-- ============================================================================
-- CONTACTS + IDENTIDAD CROSS-CANAL
-- ============================================================================

create table contacts (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  full_name text not null,
  job_title text,
  email citext,
  phone text,
  whatsapp text,
  city text,
  region text,
  country text default 'CL',
  source text,                      -- 'web', 'referido', 'campaña X'
  status contact_status default 'lead',
  owner_id uuid references auth.users(id),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id),
  last_interaction_at timestamptz
);

create index on contacts(organization_id);
create index on contacts(organization_id, status);
create index on contacts(organization_id, owner_id);
create index on contacts(organization_id, full_name);

-- Identidad unificada cross-canal (un contacto puede tener varios handles)
create table contact_channels (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid not null references contacts(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  channel channel_type not null,
  identifier text not null,         -- número WA, email, @user, etc.
  is_primary boolean default false,
  verified boolean default false,
  created_at timestamptz default now(),
  unique (organization_id, channel, identifier)
);

create index on contact_channels(contact_id);

-- ============================================================================
-- PIPELINES + DEALS (CRM)
-- ============================================================================

create table pipelines (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id, name)
);

create table pipeline_stages (
  id uuid primary key default uuid_generate_v4(),
  pipeline_id uuid not null references pipelines(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  position int not null default 0,
  win_probability numeric(5,2) default 0,    -- 0-100
  is_won boolean default false,
  is_lost boolean default false,
  color text default '#64748B'
);

create index on pipeline_stages(pipeline_id, position);

create table deals (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  pipeline_id uuid not null references pipelines(id) on delete restrict,
  stage_id uuid not null references pipeline_stages(id) on delete restrict,
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  owner_id uuid references auth.users(id),
  title text not null,
  description text,
  value_amount numeric(14,2) default 0,
  currency text default 'CLP',
  expected_close_date date,
  closed_at timestamptz,
  is_won boolean default false,
  is_lost boolean default false,
  lost_reason text,
  next_action text,
  next_action_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create index on deals(organization_id);
create index on deals(organization_id, stage_id);
create index on deals(organization_id, owner_id);
create index on deals(organization_id, contact_id);

-- ============================================================================
-- CHANNELS (cuentas conectadas) + TICKETS + MESSAGES
-- ============================================================================

create table channels (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type channel_type not null,
  name text not null,
  identifier text,                  -- número, email corp, @handle
  config jsonb default '{}'::jsonb, -- credenciales encriptadas, webhook url, etc.
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id, type, identifier)
);

create index on channels(organization_id);

create table tickets (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  number bigserial not null,        -- número humano: #67736
  channel_id uuid references channels(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  assignee_id uuid references auth.users(id),
  team_id uuid references teams(id),
  subject text,
  status ticket_status default 'new',
  priority ticket_priority default 'normal',
  tags text[] default '{}',
  due_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  first_response_at timestamptz,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id),
  unique (organization_id, number)
);

create index on tickets(organization_id, status);
create index on tickets(organization_id, assignee_id);
create index on tickets(organization_id, contact_id);
create index on tickets(organization_id, last_message_at desc);

create table ticket_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  sender_type text not null check (sender_type in ('contact','agent','bot','system')),
  sender_id uuid,                   -- user_id o contact_id según sender_type
  body text,
  attachments jsonb default '[]'::jsonb,
  is_internal boolean default false, -- nota interna vs mensaje al cliente
  created_at timestamptz default now()
);

create index on ticket_messages(ticket_id, created_at);

-- ============================================================================
-- TASKS / NOTES / FILES / INTERACTIONS
-- ============================================================================

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  status task_status default 'open',
  priority task_priority default 'normal',
  due_at timestamptz,
  completed_at timestamptz,
  assignee_id uuid references auth.users(id),
  -- Relación polimórfica opcional
  related_type entity_type,
  related_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create index on tasks(organization_id, status);
create index on tasks(organization_id, assignee_id);
create index on tasks(organization_id, due_at);
create index on tasks(organization_id, related_type, related_id);

create table notes (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  body text not null,
  related_type entity_type not null,
  related_id uuid not null,
  author_id uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on notes(organization_id, related_type, related_id);

create table files (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  storage_path text not null,       -- bucket path en Supabase Storage
  name text not null,
  mime_type text,
  size_bytes bigint,
  related_type entity_type,
  related_id uuid,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create index on files(organization_id, related_type, related_id);

create table interactions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type interaction_type not null,
  contact_id uuid references contacts(id) on delete cascade,
  deal_id uuid references deals(id) on delete set null,
  ticket_id uuid references tickets(id) on delete set null,
  user_id uuid references auth.users(id),
  subject text,
  body text,
  occurred_at timestamptz default now(),
  duration_seconds int,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index on interactions(organization_id, contact_id, occurred_at desc);

-- ============================================================================
-- CAMPOS PERSONALIZADOS (custom fields polimórficos)
-- ============================================================================

create table custom_fields (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  entity_type entity_type not null,
  key text not null,                -- 'agendo_reunion'
  label text not null,              -- 'Agendó Reunión?'
  field_type text not null check (field_type in ('text','number','select','multi_select','date','boolean')),
  options jsonb default '[]'::jsonb, -- para selects
  is_required boolean default false,
  position int default 0,
  created_at timestamptz default now(),
  unique (organization_id, entity_type, key)
);

create table custom_field_values (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  field_id uuid not null references custom_fields(id) on delete cascade,
  entity_id uuid not null,
  value jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (field_id, entity_id)
);

create index on custom_field_values(organization_id, entity_id);

-- ============================================================================
-- TAGS (polimórfico)
-- ============================================================================

create table tags (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  color text default '#64748B',
  unique (organization_id, name)
);

create table taggings (
  tag_id uuid not null references tags(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  entity_type entity_type not null,
  entity_id uuid not null,
  primary key (tag_id, entity_type, entity_id)
);

create index on taggings(organization_id, entity_type, entity_id);

-- ============================================================================
-- VISTAS GUARDADAS (filtros dinámicos)
-- ============================================================================

create table saved_views (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references auth.users(id),  -- null = compartida con la org
  entity_type entity_type not null,
  name text not null,
  filters jsonb default '{}'::jsonb,
  sort jsonb default '{}'::jsonb,
  visible_columns text[] default '{}',
  is_shared boolean default false,
  position int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on saved_views(organization_id, entity_type);

-- ============================================================================
-- AUDITORÍA + NOTIFICACIONES
-- ============================================================================

create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,             -- 'created','updated','deleted','assigned',...
  entity_type entity_type not null,
  entity_id uuid not null,
  changes jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

create index on audit_logs(organization_id, entity_type, entity_id, created_at desc);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  link_url text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index on notifications(user_id, is_read, created_at desc);

-- ============================================================================
-- TRIGGERS updated_at
-- ============================================================================

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'organizations','profiles','memberships','teams','companies','contacts',
      'pipelines','deals','channels','tickets','tasks','notes','custom_field_values',
      'saved_views'
    ])
  loop
    execute format(
      'create trigger trg_%s_updated_at before update on %s for each row execute function set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table organizations       enable row level security;
alter table profiles            enable row level security;
alter table memberships         enable row level security;
alter table teams               enable row level security;
alter table team_members        enable row level security;
alter table companies           enable row level security;
alter table contacts            enable row level security;
alter table contact_channels    enable row level security;
alter table pipelines           enable row level security;
alter table pipeline_stages     enable row level security;
alter table deals               enable row level security;
alter table channels            enable row level security;
alter table tickets             enable row level security;
alter table ticket_messages     enable row level security;
alter table tasks               enable row level security;
alter table notes               enable row level security;
alter table files               enable row level security;
alter table interactions        enable row level security;
alter table custom_fields       enable row level security;
alter table custom_field_values enable row level security;
alter table tags                enable row level security;
alter table taggings            enable row level security;
alter table saved_views         enable row level security;
alter table audit_logs          enable row level security;
alter table notifications       enable row level security;

-- profiles: cada usuario ve/edita su perfil
create policy "profiles_self_select" on profiles for select using (id = auth.uid());
create policy "profiles_self_update" on profiles for update using (id = auth.uid());
create policy "profiles_self_insert" on profiles for insert with check (id = auth.uid());

-- organizations: ves las orgs en las que tienes membership
create policy "orgs_member_select" on organizations for select
  using (exists (select 1 from memberships m where m.organization_id = organizations.id and m.user_id = auth.uid()));
create policy "orgs_owner_update" on organizations for update
  using (exists (select 1 from memberships m where m.organization_id = organizations.id and m.user_id = auth.uid() and m.role in ('owner','admin')));
create policy "orgs_authenticated_insert" on organizations for insert with check (auth.uid() is not null);

-- memberships: ves los miembros de tus orgs
create policy "memberships_org_select" on memberships for select
  using (exists (select 1 from memberships m2 where m2.organization_id = memberships.organization_id and m2.user_id = auth.uid()));
create policy "memberships_admin_modify" on memberships for all
  using (exists (select 1 from memberships m2 where m2.organization_id = memberships.organization_id and m2.user_id = auth.uid() and m2.role in ('owner','admin')))
  with check (exists (select 1 from memberships m2 where m2.organization_id = memberships.organization_id and m2.user_id = auth.uid() and m2.role in ('owner','admin')));

-- Política genérica reutilizable: pertenece a la org del usuario
-- La aplicamos a todas las tablas de negocio.
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'teams','companies','contacts','contact_channels','pipelines','pipeline_stages',
      'deals','channels','tickets','ticket_messages','tasks','notes','files',
      'interactions','custom_fields','custom_field_values','tags','taggings',
      'saved_views','audit_logs','notifications'
    ])
  loop
    execute format($f$
      create policy "%1$s_org_select" on %1$s for select
        using (exists (select 1 from memberships m where m.organization_id = %1$s.organization_id and m.user_id = auth.uid()));
      create policy "%1$s_org_insert" on %1$s for insert
        with check (exists (select 1 from memberships m where m.organization_id = %1$s.organization_id and m.user_id = auth.uid()));
      create policy "%1$s_org_update" on %1$s for update
        using (exists (select 1 from memberships m where m.organization_id = %1$s.organization_id and m.user_id = auth.uid()));
      create policy "%1$s_org_delete" on %1$s for delete
        using (exists (select 1 from memberships m where m.organization_id = %1$s.organization_id and m.user_id = auth.uid() and m.role in ('owner','admin','manager')));
    $f$, t);
  end loop;
end $$;

-- team_members: derivado de teams
create policy "team_members_select" on team_members for select
  using (exists (select 1 from teams t join memberships m on m.organization_id = t.organization_id where t.id = team_members.team_id and m.user_id = auth.uid()));
create policy "team_members_modify" on team_members for all
  using (exists (select 1 from teams t join memberships m on m.organization_id = t.organization_id where t.id = team_members.team_id and m.user_id = auth.uid() and m.role in ('owner','admin','manager')));

-- ============================================================================
-- TRIGGER: crear profile al registrar usuario
-- ============================================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- TRIGGER: actualizar last_message_at en tickets cuando llega mensaje
-- ============================================================================

create or replace function bump_ticket_last_message()
returns trigger language plpgsql as $$
begin
  update tickets set last_message_at = new.created_at, updated_at = now()
  where id = new.ticket_id;
  return new;
end $$;

create trigger trg_bump_ticket after insert on ticket_messages
  for each row execute function bump_ticket_last_message();

-- ============================================================================
-- TRIGGER: actualizar last_interaction_at en contacts
-- ============================================================================

create or replace function bump_contact_last_interaction()
returns trigger language plpgsql as $$
begin
  if new.contact_id is not null then
    update contacts set last_interaction_at = new.occurred_at
    where id = new.contact_id and (last_interaction_at is null or last_interaction_at < new.occurred_at);
  end if;
  return new;
end $$;

create trigger trg_bump_contact after insert on interactions
  for each row execute function bump_contact_last_interaction();
