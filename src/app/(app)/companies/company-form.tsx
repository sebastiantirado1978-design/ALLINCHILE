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
import { companySchema, type CompanyInput } from "@/lib/validations/company";
import { createCompanyAction, updateCompanyAction } from "@/server/actions/companies";

export function CompanyForm({
  companyId,
  initial,
}: {
  companyId?: string;
  initial?: Partial<CompanyInput>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initial?.name ?? "",
      legal_name: initial?.legal_name ?? "",
      tax_id: initial?.tax_id ?? "",
      industry: initial?.industry ?? "",
      website: initial?.website ?? "",
      size: initial?.size ?? "",
      country: initial?.country ?? "CL",
      city: initial?.city ?? "",
      address: initial?.address ?? "",
      notes: initial?.notes ?? "",
    },
  });

  async function onSubmit(values: CompanyInput) {
    setServerError(null);
    const res = companyId
      ? await updateCompanyAction(companyId, values)
      : await createCompanyAction(values);
    if (res?.error) {
      setServerError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success(companyId ? "Empresa actualizada" : "Empresa creada");
    router.push(companyId ? `/companies/${companyId}` : `/companies/${res.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Datos de la empresa</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nombre comercial *</Label>
            <Input id="name" placeholder="ACME SpA" {...register("name")} />
            {errors.name && <p className="text-sm text-[var(--danger)]">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal_name">Razón social</Label>
            <Input id="legal_name" placeholder="Nombre legal" {...register("legal_name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_id">RUT / Tax ID</Label>
            <Input id="tax_id" placeholder="76.123.456-7" {...register("tax_id")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industria</Label>
            <Input id="industry" placeholder="Retail, Servicios..." {...register("industry")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Tamaño</Label>
            <select
              id="size"
              className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
              {...register("size")}
            >
              <option value="">Seleccionar</option>
              <option value="1-10">1-10 empleados</option>
              <option value="11-50">11-50 empleados</option>
              <option value="51-200">51-200 empleados</option>
              <option value="201-500">201-500 empleados</option>
              <option value="501-1000">501-1000 empleados</option>
              <option value="1000+">Más de 1000</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="website">Sitio web</Label>
            <Input id="website" placeholder="https://acme.cl" {...register("website")} />
            {errors.website && <p className="text-sm text-[var(--danger)]">{errors.website.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubicación</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <select
              id="country"
              className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
              {...register("country")}
            >
              <option value="CL">Chile</option>
              <option value="AR">Argentina</option>
              <option value="PE">Perú</option>
              <option value="CO">Colombia</option>
              <option value="MX">México</option>
              <option value="US">Estados Unidos</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" placeholder="Santiago" {...register("city")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" placeholder="Av. Apoquindo 1234, Las Condes" {...register("address")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            rows={4}
            className="w-full px-3 py-2 rounded-md border border-[var(--input)] bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            placeholder="Notas internas sobre esta empresa..."
            {...register("notes")}
          />
        </CardContent>
      </Card>

      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Link href={companyId ? `/companies/${companyId}` : "/companies"}>
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
        <Button type="submit" loading={isSubmitting}>
          {companyId ? "Guardar cambios" : "Crear empresa"}
        </Button>
      </div>
    </form>
  );
}
