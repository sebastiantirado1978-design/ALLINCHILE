import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentOrg } from "@/server/queries/me";
import { getContact } from "@/server/queries/contacts";
import { listCompanies } from "@/server/queries/companies";
import { ContactForm } from "../../contact-form";

export const dynamic = "force-dynamic";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const { id } = await params;
  const contact = await getContact(org.id, id);
  if (!contact) notFound();

  const companies = await listCompanies(org.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/contacts/${id}`}
          className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-[var(--muted)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar contacto</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Actualiza los datos de {contact.full_name}.
          </p>
        </div>
      </div>

      <ContactForm
        contactId={id}
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
        initial={{
          full_name: contact.full_name,
          job_title: contact.job_title ?? "",
          email: contact.email ?? "",
          phone: contact.phone ?? "",
          whatsapp: contact.whatsapp ?? "",
          city: contact.city ?? "",
          region: contact.region ?? "",
          source: contact.source ?? "",
          notes: contact.notes ?? "",
          status: contact.status,
          company_id: contact.company_id ?? "",
        }}
      />
    </div>
  );
}
