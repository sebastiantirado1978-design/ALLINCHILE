"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dealSchema, type DealInput } from "@/lib/validations/deal";
import { createDealAction, updateDealAction } from "@/server/actions/deals";
import type { Pipeline, Stage } from "@/server/queries/deals";

type Member = { id: string; full_name: string | null; email: string };
type ContactLite = { id: string; full_name: string };

export function DealForm({
  pipelines,
  stages,
  contacts,
  members,
  initial,
  dealId,
}: {
  pipelines: Pipeline[];
  stages: Stage[];
  contacts: ContactLite[];
  members: Member[];
  initial?: Partial<DealInput>;
  dealId?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pipelineId, setPipelineId] = useState(
    initial?.pipeline_id ?? pipelines[0]?.id ?? "",
  );
  const stagesForPipeline = stages.filter((s) => s.pipeline_id === pipelineId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DealInput>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      pipeline_id: initial?.pipeline_id ?? pipelines[0]?.id ?? "",
      stage_id: initial?.stage_id ?? stagesForPipeline[0]?.id ?? "",
      contact_id: initial?.contact_id ?? "",
      owner_id: initial?.owner_id ?? "",
      value_amount: initial?.value_amount ?? 0,
      currency: initial?.currency ?? "CLP",
      expected_close_date: initial?.expected_close_date ?? "",
      next_action: initial?.next_action ?? "",
      next_action_at: initial?.next_action_at ?? "",
    },
  });

  async function onSubmit(values: DealInput) {
    setServerError(null);
    const res = dealId
      ? await updateDealAction(dealId, values)
      : await createDealAction(values);
    if (res?.error) {
      setServerError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success(dealId ? "Oportunidad actualizada" : "Oportunidad creada");
    router.push("/deals");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" placeholder="Implementación CRM Empresa X" {...register("title")} />
            {errors.title && <p className="text-sm text-[var(--danger)]">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-[var(--input)] bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              placeholder="Detalles adicionales de la oportunidad..."
              {...register("description")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pipeline_id">Pipeline</Label>
              <select
                id="pipeline_id"
                className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
                {...register("pipeline_id")}
                onChange={(e) => {
                  setPipelineId(e.target.value);
                  const next = stages.find((s) => s.pipeline_id === e.target.value);
                  if (next) setValue("stage_id", next.id);
                }}
              >
                {pipelines.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage_id">Etapa</Label>
              <select
                id="stage_id"
                className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
                {...register("stage_id")}
              >
                {stagesForPipeline.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {errors.stage_id && <p className="text-sm text-[var(--danger)]">{errors.stage_id.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valor y cierre</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="value_amount">Valor estimado</Label>
            <Input id="value_amount" type="number" step="1" min="0" {...register("value_amount", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Moneda</Label>
            <select
              id="currency"
              className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
              {...register("currency")}
            >
              <option value="CLP">CLP</option>
              <option value="USD">USD</option>
              <option value="UF">UF</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expected_close_date">Cierre esperado</Label>
            <Input id="expected_close_date" type="date" {...register("expected_close_date")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="next_action_at">Próxima acción (fecha)</Label>
            <Input id="next_action_at" type="datetime-local" {...register("next_action_at")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="next_action">Próxima acción (descripción)</Label>
            <Input id="next_action" placeholder="Llamar para confirmar reunión..." {...register("next_action")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asociaciones</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_id">Contacto</Label>
            <select
              id="contact_id"
              className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
              {...register("contact_id")}
            >
              <option value="">Sin asociar</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_id">Responsable</Label>
            <select
              id="owner_id"
              className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
              {...register("owner_id")}
            >
              <option value="">Sin asignar</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name ?? m.email}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Link href="/deals">
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
        <Button type="submit" loading={isSubmitting}>
          {dealId ? "Guardar cambios" : "Crear oportunidad"}
        </Button>
      </div>
    </form>
  );
}
