"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import { DealCard } from "./deal-card";
import { moveDealToStageAction } from "@/server/actions/deals";
import type { DealRow, Stage } from "@/server/queries/deals";

type DealsByStage = Record<string, DealRow[]>;

function StageColumn({
  stage,
  deals,
}: {
  stage: Stage;
  deals: DealRow[];
}) {
  const { setNodeRef, isOver } = useSortable({
    id: `stage-${stage.id}`,
    data: { type: "stage", stageId: stage.id },
  });

  const total = deals.reduce((sum, d) => sum + Number(d.value_amount ?? 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-[280px] shrink-0 bg-[var(--muted)] rounded-xl border transition-colors",
        isOver ? "border-[var(--accent)] bg-cyan-50/50" : "border-[var(--border)]",
      )}
    >
      <div className="px-3 py-2.5 border-b border-[var(--border)] sticky top-0 bg-[var(--muted)] rounded-t-xl">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
            <p className="text-xs font-semibold uppercase tracking-wide truncate">
              {stage.name}
            </p>
          </div>
          <span className="text-xs font-medium text-[var(--muted-foreground)] bg-white px-1.5 py-0.5 rounded">
            {deals.length}
          </span>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          {formatCurrency(total)}
        </p>
      </div>

      <div className="flex-1 p-2 space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto min-h-[120px]">
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.length === 0 ? (
            <div className="text-xs text-[var(--muted-foreground)] text-center py-8 border-2 border-dashed border-[var(--border)] rounded-lg">
              Arrastra aquí
            </div>
          ) : (
            deals.map((d) => <DealCard key={d.id} deal={d} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export function PipelineBoard({
  stages,
  deals,
}: {
  stages: Stage[];
  deals: DealRow[];
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [optimisticDeals, setOptimisticDeals] = useState(deals);
  const [activeDeal, setActiveDeal] = useState<DealRow | null>(null);
  const [, start] = useTransition();

  const dealsByStage = useMemo<DealsByStage>(() => {
    const map: DealsByStage = {};
    for (const s of stages) map[s.id] = [];
    for (const d of optimisticDeals) {
      if (map[d.stage_id]) map[d.stage_id].push(d);
    }
    return map;
  }, [optimisticDeals, stages]);

  function onDragStart(e: DragStartEvent) {
    const deal = optimisticDeals.find((d) => d.id === e.active.id);
    setActiveDeal(deal ?? null);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = e;
    if (!over) return;

    const dealId = String(active.id);
    const overId = String(over.id);
    const overData = over.data.current as { type?: string; stageId?: string } | undefined;
    const activeData = active.data.current as { deal?: DealRow } | undefined;
    const movedDeal = activeData?.deal;
    if (!movedDeal) return;

    let targetStageId: string | undefined;
    if (overData?.type === "stage") {
      targetStageId = overData.stageId;
    } else {
      // Soltó sobre otra card → buscar su stage
      const overDeal = optimisticDeals.find((d) => d.id === overId);
      targetStageId = overDeal?.stage_id;
    }
    if (!targetStageId || targetStageId === movedDeal.stage_id) return;

    // Optimistic update
    setOptimisticDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage_id: targetStageId! } : d)),
    );

    start(async () => {
      const res = await moveDealToStageAction(dealId, targetStageId!);
      if (res?.error) {
        // Revert
        setOptimisticDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, stage_id: movedDeal.stage_id } : d)),
        );
        toast.error(res.error);
      } else {
        const stageName = stages.find((s) => s.id === targetStageId)?.name;
        toast.success(`Movido a ${stageName}`);
      }
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <SortableContext items={stages.map((s) => `stage-${s.id}`)}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map((s) => (
            <StageColumn key={s.id} stage={s} deals={dealsByStage[s.id] ?? []} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeDeal ? <DealCard deal={activeDeal} dragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
