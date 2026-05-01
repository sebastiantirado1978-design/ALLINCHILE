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
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { createContactAction, updateContactAction } from "@/server/actions/contacts";

type CompanyOption = { id: string; name: string };

export function ContactForm({
  contactId,
  initial,
  companies = [],
}: {
  contactId?: string;
  initial?: Partial<ContactInput>;
  companies?: CompanyOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      full_name: initial?.full_name ?? "",
      job_title: initial?.job_title ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      whatsapp: initial?.whatsapp ?? "",
      city: initial?.city ?? "",
      region: initial?.region ?? "",
      source: initial?.source ?? "",
      notes: initial?.notes ?? "",
      status: initial?.status ?? "lead",
      company_id: initial?.company_id ?? "",
      consent_given: initial?.consent_given ?? false,
      consent_source: initial?.consent_source ?? "manual",
    },
  });

  async function onSubmit(values: ContactInput) {
    setServerError(null);
    const res = contactId
      ? await updateContactAction(contactId, values)
      : await createContactAction(values);
    if (res.error) {
      setServerError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success(contactId ? "Contacto actualizado" : "Contacto creado");
    router.push(contactId ? `/contacts/${contactId}` : "/contacts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="full_name">Nombre completo *</Label>
            <Input id="full_name" placeholder="Juan Pérez" {...register("full_name")} />
            {errors.full_name && (
              <p className="text-sm text-[var(--danger)]">{errors.full_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="job_title">Cargo</Label>
            <Input id="job_title" placeholder="Gerente Comercial" {...register("job_title")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
              {...register("status")}
            >
              <option value="lead">Lead</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="churned">Perdido</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="company_id">Empresa</Label>
            <select
              id="company_id"
              className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
              {...register("company_id")}
            >
              <option value="">Sin empresa</option>
              {companies.map((co) => (
                <option key={co.id} value={co.id}>
                  {co.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="juan@empresa.cl" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-[var(--danger)]">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" placeholder="+56 9 1234 5678" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" placeholder="+56 9 1234 5678" {...register("whatsapp")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" placeholder="Santiago" {...register("city")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Origen y notas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source">Fuente</Label>
            <Input id="source" placeholder="Web, Referido, Campaña..." {...register("source")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              rows={4}
              className="w-full px-3 py-2 rounded-md border border-[var(--input)] bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              placeholder="Cualquier dato relevante sobre este contacto..."
              {...register("notes")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consentimiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-[var(--input)]"
              {...register("consent_given")}
            />
            <span className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Confirmo que este contacto autorizó ser contactado para fines
              comerciales (Ley 21.719 / 19.628). El consentimiento podrá
              revocarse en cualquier momento desde el link de baja en los
              mensajes salientes.
            </span>
          </label>
          <input type="hidden" {...register("consent_source")} />
        </CardContent>
      </Card>

      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Link href={contactId ? `/contacts/${contactId}` : "/contacts"}>
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
        <Button type="submit" loading={isSubmitting}>
          {contactId ? "Guardar cambios" : "Crear contacto"}
        </Button>
      </div>
    </form>
  );
}
