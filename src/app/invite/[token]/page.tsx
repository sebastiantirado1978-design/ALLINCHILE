import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvitationByToken } from "@/server/queries/settings";
import { createClient } from "@/lib/supabase/server";
import { AcceptInviteForm } from "./accept-form";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return (
      <ErrorScreen
        title="Invitación no encontrada"
        message="Este link no existe o fue revocado. Pídele a tu equipo que te genere uno nuevo."
      />
    );
  }
  if (invitation.accepted_at) {
    return (
      <ErrorScreen
        title="Invitación ya aceptada"
        message="Este link fue usado anteriormente. Inicia sesión para acceder."
        cta="/login"
        ctaLabel="Ir al login"
      />
    );
  }
  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return (
      <ErrorScreen
        title="Invitación expirada"
        message="Este link expiró. Pídele a tu equipo que te genere uno nuevo."
      />
    );
  }

  const orgData = invitation.organization as unknown as
    | { id: string; name: string; slug: string }
    | null;
  const orgName = orgData?.name ?? "esta organización";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && user.email && user.email.toLowerCase() === invitation.email.toLowerCase()) {
    return (
      <Wrapper>
        <Card>
          <CardHeader>
            <CardTitle>Te están invitando a {orgName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              Vas a entrar como <strong className="capitalize">{invitation.role}</strong>.
            </p>
            <AcceptInviteForm token={token} />
          </CardContent>
        </Card>
      </Wrapper>
    );
  }

  if (user && user.email && user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <ErrorScreen
        title="Email no coincide"
        message={`Esta invitación es para ${invitation.email}, pero estás logueado como ${user.email}. Cierra sesión y vuelve a intentar.`}
      />
    );
  }

  // No logueado: mandarlo a signup con el email pre-llenado
  redirect(`/signup?invite=${token}&email=${encodeURIComponent(invitation.email)}`);
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

function ErrorScreen({
  title,
  message,
  cta,
  ctaLabel,
}: {
  title: string;
  message: string;
  cta?: string;
  ctaLabel?: string;
}) {
  return (
    <Wrapper>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">{message}</p>
          {cta ? (
            <Link href={cta} className="text-sm text-[var(--primary)] hover:underline">
              {ctaLabel}
            </Link>
          ) : (
            <Link href="/" className="text-sm text-[var(--primary)] hover:underline">
              Volver al inicio
            </Link>
          )}
        </CardContent>
      </Card>
    </Wrapper>
  );
}
