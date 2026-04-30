import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentOrg } from "@/server/queries/me";
import { listOrgMembers } from "@/server/queries/tasks";
import { listContacts } from "@/server/queries/contacts";
import { TicketForm } from "./ticket-form";

export const dynamic = "force-dynamic";

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ contact_id?: string }>;
}) {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const [members, contacts] = await Promise.all([
    listOrgMembers(org.id),
    listContacts(org.id),
  ]);
  const params = await searchParams;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/inbox"
          className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-[var(--muted)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo ticket</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Crea un ticket manualmente o ingresa el primer mensaje del cliente.
          </p>
        </div>
      </div>

      <TicketForm
        members={members}
        contacts={contacts.map((c) => ({ id: c.id, full_name: c.full_name }))}
        defaultContactId={params.contact_id}
      />
    </div>
  );
}
