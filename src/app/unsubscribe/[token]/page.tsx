import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { UnsubscribeForm } from "./unsubscribe-form";

export const metadata: Metadata = {
  title: "Darse de baja — ALLINCHILE",
  description: "Darse de baja de las comunicaciones.",
  robots: { index: false, follow: false },
};

async function getContactByToken(token: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("contacts")
    .select(
      "id, full_name, email, unsubscribed_at, organization:organizations(id, name)",
    )
    .eq("unsubscribe_token", token)
    .maybeSingle();
  return data;
}

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const contact = await getContactByToken(token);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-[var(--border)] p-10 shadow-sm">
        <Link href="/" className="block text-center mb-8 text-xl font-bold tracking-tight">
          ALLIN<span className="text-[var(--accent)]">CHILE</span>
        </Link>

        {!contact ? (
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold">Link no válido</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Este enlace ya no existe o caducó. Si te llegó un mensaje no
              deseado, contáctanos en{" "}
              <a
                href="mailto:privacidad@allinchile.cl"
                className="text-[var(--accent)] underline"
              >
                privacidad@allinchile.cl
              </a>
              .
            </p>
          </div>
        ) : contact.unsubscribed_at ? (
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold">Ya estás dado de baja</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Tu contacto ({contact.email ?? contact.full_name}) ya está dado
              de baja desde{" "}
              {new Date(contact.unsubscribed_at).toLocaleDateString("es-CL")}.
              No recibirás más comunicaciones comerciales.
            </p>
          </div>
        ) : (
          <UnsubscribeForm
            token={token}
            contactName={contact.full_name}
            contactEmail={contact.email}
            orgName={
              (contact.organization as unknown as { name?: string })?.name ?? "la organización"
            }
          />
        )}
      </div>
    </div>
  );
}
