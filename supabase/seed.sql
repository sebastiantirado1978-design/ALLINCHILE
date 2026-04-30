-- ============================================================================
-- ALLINCHILE — Seed de demo (opcional)
-- Ejecutar SOLO en entornos de desarrollo. Crea una org demo + datos base.
-- ============================================================================

-- Pipeline por defecto y etapas para una org dada
-- Reemplazar :org_id por el UUID real de tu organización
do $$
declare
  v_org uuid := :'org_id';
  v_pipeline uuid;
begin
  insert into pipelines (organization_id, name, is_default)
  values (v_org, 'Ventas', true) returning id into v_pipeline;

  insert into pipeline_stages (pipeline_id, organization_id, name, position, win_probability, color)
  values
    (v_pipeline, v_org, 'Nuevo contacto',     0, 5,   '#94A3B8'),
    (v_pipeline, v_org, 'Contactado',         1, 15,  '#60A5FA'),
    (v_pipeline, v_org, 'Reunión agendada',   2, 30,  '#38BDF8'),
    (v_pipeline, v_org, 'Propuesta enviada',  3, 50,  '#A78BFA'),
    (v_pipeline, v_org, 'Negociación',        4, 75,  '#FBBF24');

  insert into pipeline_stages (pipeline_id, organization_id, name, position, win_probability, is_won, color)
  values (v_pipeline, v_org, 'Ganado', 5, 100, true, '#10B981');

  insert into pipeline_stages (pipeline_id, organization_id, name, position, win_probability, is_lost, color)
  values (v_pipeline, v_org, 'Perdido', 6, 0, true, '#EF4444');
end $$;
