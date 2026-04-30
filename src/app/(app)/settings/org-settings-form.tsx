"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { orgSettingsSchema, type OrgSettingsInput } from "@/lib/validations/settings";
import { updateOrgSettingsAction } from "@/server/actions/settings";

export function OrgSettingsForm({
  canEdit,
  initial,
}: {
  canEdit: boolean;
  initial: OrgSettingsInput;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<OrgSettingsInput>({
    resolver: zodResolver(orgSettingsSchema),
    defaultValues: initial,
  });

  const primaryColor = watch("primary_color");

  async function onSubmit(values: OrgSettingsInput) {
    setServerError(null);
    const res = await updateOrgSettingsAction(values);
    if (res?.error) {
      setServerError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success("Configuración guardada");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Datos de tu organización</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" disabled={!canEdit} {...register("name")} />
            {errors.name && <p className="text-sm text-[var(--danger)]">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industria</Label>
            <Input
              id="industry"
              placeholder="Retail, Servicios, Tecnología..."
              disabled={!canEdit}
              {...register("industry")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <select
              id="country"
              disabled={!canEdit}
              className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm disabled:opacity-50"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Marca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Color principal (hex)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="primary_color"
                  placeholder="#0EA5E9"
                  disabled={!canEdit}
                  {...register("primary_color")}
                />
                <div
                  className="h-10 w-10 rounded-md border border-[var(--border)] shrink-0"
                  style={{ background: primaryColor || "#0EA5E9" }}
                />
              </div>
              {errors.primary_color && (
                <p className="text-sm text-[var(--danger)]">{errors.primary_color.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">URL del logo</Label>
              <Input
                id="logo_url"
                placeholder="https://..."
                disabled={!canEdit}
                {...register("logo_url")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {canEdit && (
        <div className="flex items-center justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Guardar cambios
          </Button>
        </div>
      )}

      {!canEdit && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          Solo owners y admins pueden editar la configuración.
        </div>
      )}
    </form>
  );
}
