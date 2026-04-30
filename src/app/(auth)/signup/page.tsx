"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { signupAction } from "@/server/actions/auth";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const inviteToken = params.get("invite") ?? undefined;
  const inviteEmail = params.get("email") ?? "";
  const isInvite = !!inviteToken;

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      organization_name: isInvite ? undefined : "",
      email: inviteEmail,
      password: "",
      invite_token: inviteToken,
    },
  });

  async function onSubmit(values: SignupInput) {
    setServerError(null);
    const res = await signupAction(values);
    if (res.error) {
      setServerError(res.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="lg:hidden text-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          ALLIN<span className="text-[var(--accent)]">CHILE</span>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isInvite ? "Únete a tu equipo" : "Crea tu cuenta"}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          {isInvite
            ? "Completa tus datos para aceptar la invitación."
            : "Empieza gratis. Puedes invitar a tu equipo después."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register("invite_token")} />

        <div className="space-y-2">
          <Label htmlFor="full_name">Tu nombre</Label>
          <Input id="full_name" placeholder="Sebastián Tirado" {...register("full_name")} />
          {errors.full_name && (
            <p className="text-sm text-[var(--danger)]">{errors.full_name.message}</p>
          )}
        </div>

        {!isInvite && (
          <div className="space-y-2">
            <Label htmlFor="organization_name">Nombre de tu empresa</Label>
            <Input
              id="organization_name"
              placeholder="Mi Empresa SpA"
              {...register("organization_name")}
            />
            {errors.organization_name && (
              <p className="text-sm text-[var(--danger)]">{errors.organization_name.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@empresa.cl"
            autoComplete="email"
            readOnly={!!inviteEmail}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-[var(--danger)]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-[var(--danger)]">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          {isInvite ? "Crear cuenta y unirme" : "Crear cuenta"}
        </Button>

        {!isInvite && (
          <p className="text-xs text-[var(--muted-foreground)] text-center">
            Al crear cuenta aceptas los términos y la política de privacidad.
          </p>
        )}
      </form>

      <p className="text-sm text-center text-[var(--muted-foreground)]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
