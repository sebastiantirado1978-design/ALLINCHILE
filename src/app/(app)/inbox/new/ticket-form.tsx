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
import { ticketSchema, type TicketInput, channelLabels, channelTypeValues } from "@/lib/validations/ticket";
import { createTicketAction } from "@/server/actions/tickets";

export function TicketForm({
  members,
  contacts,
  defaultContactId,
}: {
  members: { id: string; full_name: string | null; email: string }[];
  contacts: { id: string; full_name: string }[];
  defaultContactId?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      status: "new",
      priority: "normal",
      contact_id: defaultContactId ?? "",
      assignee_id: "",
      channel_type: "webchat",
      initial_message: "",
    },
  });

  async function onSubmit(values: TicketInput) {
    setServerError(null);
    const res = await createTicketAction(values);
    if (res?.error) {
      setServerError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success(`Ticket #${res.number} creado`);
    router.push(`/inbox/${res.id}`);
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
            <Label htmlFor="subject">Asunto *</Label>
            <Input id="subject" placeholder="Consulta sobre cotización..." {...register("subject")} />
            {errors.subject && <p className="text-sm text-[var(--danger)]">{errors.subject.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Label htmlFor="channel_type">Canal</Label>
              <select
                id="channel_type"
                className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
                {...register("channel_type")}
              >
                {channelTypeValues.map((c) => (
                  <option key={c} value={c}>{channelLabels[c]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
                {...register("status")}
              >
                <option value="new">Nuevo</option>
                <option value="in_review">En revisión</option>
                <option value="in_progress">En proceso</option>
                <option value="waiting_customer">Esperando cliente</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <select
                id="priority"
                className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
                {...register("priority")}
              >
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="assignee_id">Asignar a</Label>
              <select
                id="assignee_id"
                className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
                {...register("assignee_id")}
              >
                <option value="">Sin asignar</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name ?? m.email}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Primer mensaje (opcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            rows={5}
            className="w-full px-3 py-2 rounded-md border border-[var(--input)] bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            placeholder="Inicia la conversación con un mensaje..."
            {...register("initial_message")}
          />
        </CardContent>
      </Card>

      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Link href="/inbox">
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
        <Button type="submit" loading={isSubmitting}>Crear ticket</Button>
      </div>
    </form>
  );
}
