-- ============================================================================
-- ALLINCHILE — Migration 0008: triggers de audit_logs en entidades
-- ============================================================================
-- Activa la tabla audit_logs (creada vacía en 0001) escribiendo automáticamente
-- en cada INSERT/UPDATE/DELETE de las entidades de negocio. Bypasea cualquier
-- olvido del developer porque corre a nivel de DB.
--
-- Diseño:
--   - Función única log_audit_event() que TG_OP/TG_TABLE_NAME/NEW/OLD hace todo.
--   - Trigger AFTER INSERT/UPDATE/DELETE en contacts, companies, deals,
--     tickets, tasks. Aplica el trigger a cada tabla.
--   - actor_id viene de auth.uid() — NULL cuando es service_role (bootstrap
--     signup, webhooks, etc.) y eso está bien.
--   - changes guarda {before: OLD_jsonb, after: NEW_jsonb} salvo en INSERT
--     donde solo va after, y en DELETE donde solo va before.
-- ============================================================================

create or replace function log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_entity_id uuid;
  v_entity_type entity_type;
  v_action text;
  v_changes jsonb;
begin
  -- Mapear nombre de tabla a entity_type enum
  v_entity_type := case TG_TABLE_NAME
    when 'contacts' then 'contact'::entity_type
    when 'companies' then 'company'::entity_type
    when 'deals' then 'deal'::entity_type
    when 'tickets' then 'ticket'::entity_type
    when 'tasks' then 'task'::entity_type
  end;

  -- Acción
  v_action := lower(TG_OP);  -- 'insert','update','delete'
  if v_action = 'insert' then v_action := 'created';
  elsif v_action = 'update' then v_action := 'updated';
  elsif v_action = 'delete' then v_action := 'deleted';
  end if;

  -- Entity id y org_id según operación
  if TG_OP = 'DELETE' then
    v_entity_id := OLD.id;
    v_org_id := OLD.organization_id;
    v_changes := jsonb_build_object('before', to_jsonb(OLD));
  elsif TG_OP = 'INSERT' then
    v_entity_id := NEW.id;
    v_org_id := NEW.organization_id;
    v_changes := jsonb_build_object('after', to_jsonb(NEW));
  else  -- UPDATE
    v_entity_id := NEW.id;
    v_org_id := NEW.organization_id;
    -- Solo log si hubo cambio real
    if to_jsonb(NEW) = to_jsonb(OLD) then
      return NEW;
    end if;
    v_changes := jsonb_build_object(
      'before', to_jsonb(OLD),
      'after', to_jsonb(NEW)
    );
  end if;

  insert into audit_logs (
    organization_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    changes
  ) values (
    v_org_id,
    auth.uid(),  -- NULL si es service_role
    v_action,
    v_entity_type,
    v_entity_id,
    v_changes
  );

  -- Devolver lo que el trigger pide
  if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
end;
$$;

-- Aplicar el trigger a cada tabla de negocio
create trigger trg_audit_contacts
  after insert or update or delete on contacts
  for each row execute function log_audit_event();

create trigger trg_audit_companies
  after insert or update or delete on companies
  for each row execute function log_audit_event();

create trigger trg_audit_deals
  after insert or update or delete on deals
  for each row execute function log_audit_event();

create trigger trg_audit_tickets
  after insert or update or delete on tickets
  for each row execute function log_audit_event();

create trigger trg_audit_tasks
  after insert or update or delete on tasks
  for each row execute function log_audit_event();

-- ----------------------------------------------------------------------------
-- RLS de audit_logs: org members pueden leer logs de su org. No hay write
-- policy porque solo el trigger (security definer) escribe.
-- ----------------------------------------------------------------------------
alter table audit_logs enable row level security;

drop policy if exists "audit_logs_org_select" on audit_logs;
create policy "audit_logs_org_select" on audit_logs for select
  using (is_org_member(organization_id));

comment on function log_audit_event is
  'Trigger function que escribe en audit_logs cualquier INSERT/UPDATE/DELETE en las entidades de negocio. SECURITY DEFINER para bypass RLS al insertar.';
