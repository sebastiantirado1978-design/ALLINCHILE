"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Mail, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteSchema, type InviteInput } from "@/lib/validations/settings";
import { createInvitationAction } from "@/server/actions/settings";

export function InviteForm() {
  const router = useRouter();
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "agent" },
  });

  async function onSubmit(values: InviteInput) {
    const res = await createInvitationAction(values);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    const url = `${window.location.origin}/invite/${res.token}`;
    setLastLink(url);
    setCopied(false);
    reset();
    router.refresh();
    toast.success("Invitación creada — si tienes Resend configurado, ya se envió el email automáticamente");
  }

  async function copyLink() {
    if (!lastLink) return;
    await navigator.clipboard.writeText(lastLink);
    setCopied(true);
    toast.success("Link copiado al portapapeles");
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3 items-end">
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="colega@empresa.cl"
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-[var(--danger)]">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-role">Rol</Label>
          <select
            id="invite-role"
            className="h-10 w-full px-3 rounded-md border border-[var(--input)] bg-white text-sm"
            {...register("role")}
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="agent">Agente</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <Button type="submit" loading={isSubmitting}>
          <Mail className="h-4 w-4" />
          Invitar
        </Button>
      </div>

      {lastLink && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 space-y-2">
          <p className="text-sm font-medium text-emerald-900">
            ✓ Invitación creada. Mándale este link al invitado:
          </p>
          <div className="flex gap-2">
            <Input
              value={lastLink}
              readOnly
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="bg-white text-xs font-mono"
            />
            <Button type="button" variant="outline" size="sm" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
