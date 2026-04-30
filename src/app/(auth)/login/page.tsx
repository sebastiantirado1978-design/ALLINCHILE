"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/server/actions/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const res = await loginAction(values);
    if (res.error) {
      setServerError(res.error);
      return;
    }
    const next = params.get("next") || "/dashboard";
    router.push(next);
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
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Bienvenido de vuelta
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          Ingresa con tu cuenta para continuar.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@empresa.cl"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-[var(--danger)]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
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
          Iniciar sesión
        </Button>
      </form>

      <p className="text-sm text-center text-[var(--muted-foreground)]">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/signup" className="font-medium text-[var(--primary)] hover:underline">
          Crear cuenta gratis
        </Link>
      </p>
    </div>
  );
}
